<?php

namespace App\Http\Controllers;

use App\Models\RentalRequest;
use App\Models\Rental;
use App\Models\Customer;
use App\Models\Activity;
use App\Models\Transaction;
use App\Models\Deposit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\RentalApprovedMail;
use Inertia\Inertia;
use Inertia\Response;

class RefillController extends Controller
{
    /**
     * Display a listing of refill requests.
     */
    public function index(): Response
    {
        $refillRequests = RentalRequest::where('request_type', 'refill')
            ->with('customer')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('refills/index', [
            'rentalRequests' => $refillRequests,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Display the specified refill request.
     */
    public function show(RentalRequest $rentalRequest): Response
    {
        if ($rentalRequest->request_type !== 'refill') {
            abort(404);
        }

        $rentalRequest->load(['customer', 'product', 'rental']);

        return Inertia::render('refills/show', [
            'rentalRequest' => $rentalRequest,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Store a newly created refill request in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'tank_type' => 'required|string|max:255',
            'refill_period' => 'required|string|max:100',
            'refill_cost' => 'required|numeric|min:0'
        ]);

        $customer = Customer::findOrFail($request->customer_id);

        $rentalRequest = RentalRequest::create([
            'customer_id' => $customer->id,
            'request_type' => 'refill',
            'product_id' => null,
            'tank_type' => $request->tank_type,
            'quantity' => 1,
            'start_date' => now()->addDay()->format('Y-m-d'),
            'end_date' => now()->addDays(7)->format('Y-m-d'),
            'purpose' => "Refill period: {$request->refill_period}",
            'contact_number' => $customer->contact_number ?? 'N/A',
            'address' => $customer->address ?? 'N/A',
            'status' => 'pending',
            'admin_notes' => null,
            'rejected_reason' => null
        ]);

        // Log activity
        $admin = auth()->user();
        Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $customer->id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'refill_created',
            'description' => "Admin {$admin->name} created a refill oxygen customer request for {$request->tank_type} for {$customer->name}",
            'type' => 'info',
        ]);

        return redirect()->route('refills.index')->with('success', 'Refill request created successfully!');
    }

    /**
     * Approve the specified refill request.
     */
    public function approve(RentalRequest $rentalRequest, Request $request)
    {
        if ($rentalRequest->request_type !== 'refill') {
            abort(404);
        }

        \Log::info('Approving refill request: ' . $rentalRequest->id . ' with status: ' . $rentalRequest->status);

        $rentalRequest->update(['status' => 'approved']);
        \Log::info('Updated refill request status to approved');

        // Log activity
        $admin = auth()->user();
        Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'refill_approved',
            'description' => "Admin {$admin->name} approved refill oxygen customer request for {$rentalRequest->tank_type} from {$rentalRequest->customer->name}",
            'type' => 'success',
        ]);

        // Create rental record with deposit information
        $rentalData = [
            'rental_request_id' => $rentalRequest->id,
            'customer_id' => $rentalRequest->customer_id,
            'product_id' => $rentalRequest->product_id,
            'tank_id' => $rentalRequest->assigned_tank_id,
            'start_date' => $rentalRequest->start_date ?? now(),
            'end_date' => $rentalRequest->end_date ?? now()->addDays(30),
            'status' => 'active',
            'pickup_date' => now(),
            'deposit_type' => 'Security Deposit',
            'deposit_amount' => 0,
            'deposit_payment_date' => now(),
            'deposit_status' => 'pending',
        ];

        // Add deposit information if provided
        if ($request->has('deposit_amount') && $request->deposit_amount) {
            $rentalData['deposit_amount'] = $request->deposit_amount;
            $rentalData['deposit_payment_method'] = $request->deposit_payment_method ?? 'cash';
            $rentalData['deposit_payment_date'] = now();
            $rentalData['deposit_status'] = 'paid';
            $rentalData['deposit_reference_number'] = $request->deposit_reference_number;
        }

        // Create transaction record
        Transaction::create([
            'customer_id' => $rentalRequest->customer_id,
            'tank_id' => $rentalRequest->tank_type,
            'transaction_type' => 'Refill',
            'transaction_date' => now(),
        ]);

        \Log::info('Creating rental with data: ', $rentalData);

        $rental = Rental::create($rentalData);
        \Log::info('Created rental record: ' . $rental->id . ' with status: ' . $rental->status);

        // Create deposit record if deposit information is provided
        if ($request->has('deposit_amount') && $request->deposit_amount) {
            Deposit::create([
                'rental_id' => $rental->id,
                'customer_id' => $rentalRequest->customer_id,
                'amount' => $request->deposit_amount,
                'payment_method' => $request->deposit_payment_method ?? 'cash',
                'reference_number' => $request->deposit_reference_number,
                'status' => 'paid',
                'payment_date' => now(),
                'notes' => $request->notes,
            ]);
        }

        // Send notification to customer
        try {
            Mail::to($rentalRequest->customer->email)->send(new RentalApprovedMail($rentalRequest));
        } catch (\Exception $e) {
            \Log::error('Failed to send approval email: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Refill request approved and customer notified.');
    }

    /**
     * Dispatch the specified refill request for delivery.
     */
    public function dispatchDelivery(RentalRequest $rentalRequest)
    {
        if ($rentalRequest->request_type !== 'refill') {
            abort(404);
        }

        if ($rentalRequest->status !== 'approved') {
            return redirect()->back()->with('error', 'Only approved requests can be dispatched.');
        }

        $rentalRequest->update(['status' => 'in_transit']);

        // Log activity
        $admin = auth()->user();
        Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'refill_dispatched',
            'description' => "Admin {$admin->name} dispatched refill delivery for {$rentalRequest->tank_type} to {$rentalRequest->customer->name}",
            'type' => 'info',
        ]);

        return redirect()->back()->with('success', 'Refill order has been dispatched for delivery.');
    }

    /**
     * Reject the specified refill request.
     */
    public function reject(RentalRequest $rentalRequest, Request $request)
    {
        if ($rentalRequest->request_type !== 'refill') {
            abort(404);
        }

        $rentalRequest->update([
            'status' => 'rejected',
            'rejected_reason' => $request->rejected_reason
        ]);

        // Log activity
        $admin = auth()->user();
        Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'refill_rejected',
            'description' => "Admin {$admin->name} rejected refill oxygen customer request for {$rentalRequest->tank_type} from {$rentalRequest->customer->name}. Reason: {$request->rejected_reason}",
            'type' => 'error',
        ]);

        return redirect()->back()->with('success', 'Refill request rejected.');
    }

    /**
     * Mark the specified refill as returned/completed.
     */
    public function markAsReturned(RentalRequest $rentalRequest)
    {
        if ($rentalRequest->request_type !== 'refill') {
            abort(404);
        }

        $rentalRequest->update(['status' => 'completed']);

        if ($rentalRequest->rental) {
            $rentalRequest->rental->update([
                'status' => 'completed',
                'return_date' => now()
            ]);
        }

        // Log activity
        $admin = auth()->user();
        Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'refill_completed',
            'description' => "Admin {$admin->name} marked refill oxygen customer request for {$rentalRequest->tank_type} from {$rentalRequest->customer->name} as completed",
            'type' => 'success',
        ]);

        return redirect()->back()->with('success', 'Refill marked as completed.');
    }

    /**
     * Update the admin notes for the refill request.
     */
    public function updateNotes(RentalRequest $rentalRequest, Request $request)
    {
        if ($rentalRequest->request_type !== 'refill') {
            abort(404);
        }

        $rentalRequest->update(['admin_notes' => $request->admin_notes]);

        return redirect()->back()->with('success', 'Notes updated successfully.');
    }
}
