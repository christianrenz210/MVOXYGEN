<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use App\Models\RentalRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\RentalApprovedMail;
use Inertia\Inertia;

class RentalController extends Controller
{
    public function index()
    {
        $rentalRequests = RentalRequest::with(['customer', 'product'])
            ->where('request_type', '!=', 'refill')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('rentals/index', [
            'rentalRequests' => $rentalRequests,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    public function approve(RentalRequest $rentalRequest, Request $request)
    {
        $rentalRequest->load('product');
        
        \Log::info('Approving rental request: ' . $rentalRequest->id . ' with status: ' . $rentalRequest->status);

        // Find an available tank of the requested type
        $tank = \App\Models\Tank::where('tank_type', $rentalRequest->tank_type)
            ->where('status', 'available')
            ->where('quantity', '>', 0)
            ->first();

        if ($tank) {
            // Assign the tank ID to the rental request
            $rentalRequest->update([
                'status' => 'approved',
                'assigned_tank_id' => $tank->tank_id
            ]);

            // Reduce tank quantity
            $tank->quantity -= 1;
            if ($tank->quantity === 0) {
                $tank->status = 'rented_out';
            }
            $tank->save();

            \Log::info('Assigned tank ID: ' . $tank->tank_id . ' to rental request');
        } else {
            // Approve without assigning a tank ID if no tanks available
            $rentalRequest->update(['status' => 'approved']);
            \Log::info('No available tanks found, approved without tank ID assignment');
        }

        \Log::info('Updated rental request status to approved');

        // Log activity
        $admin = auth()->user();
        \App\Models\Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'rental_approved',
            'description' => "Admin {$admin->name} approved rental request for {$rentalRequest->tank_type} from {$rentalRequest->customer->name}",
            'type' => 'success',
        ]);

        // Create notification for customer
        $customerUser = \App\Models\User::where('name', $rentalRequest->customer->name)->first();
        if ($customerUser) {
            \App\Models\Notification::create([
                'user_id' => $customerUser->id,
                'type' => 'success',
                'title' => 'Rental Approved',
                'message' => "Your rental request for {$rentalRequest->tank_type} has been approved",
                'link' => "/user/rentals/{$rentalRequest->id}",
                'read' => false,
            ]);
        }

        // Create rental record with deposit information
        $tankPrice = 0;
        if ($tank) {
            $tankPrice = $tank->price ?? 0;
        } else {
            // Get tank price from tank type if no specific tank assigned
            $tankByType = \App\Models\Tank::where('tank_type', $rentalRequest->tank_type)->first();
            if ($tankByType) {
                $tankPrice = $tankByType->price ?? 0;
            }
        }

        $rentalData = [
            'rental_request_id' => $rentalRequest->id,
            'customer_id' => $rentalRequest->customer_id,
            'product_id' => $rentalRequest->product_id,
            'tank_id' => $rentalRequest->assigned_tank_id,
            'start_date' => $rentalRequest->start_date ?? now(),
            'end_date' => $rentalRequest->end_date ?? now()->addDays(30),
            'status' => 'active',
            'pickup_date' => now(),
            'total_amount' => $tankPrice > 0 ? $tankPrice : ($rentalRequest->product ? $rentalRequest->product->price : 0),
            'deposit_type' => 'Security Deposit',
            'deposit_amount' => 0,
            'deposit_payment_date' => now(),
            'deposit_status' => 'pending',
        ];

        // Add deposit information if provided
        if ($request->has('deposit_amount') && $request->deposit_amount) {
            // Validate minimum deposit amount
            if ($request->deposit_amount < 1000) {
                return redirect()->back()
                    ->with('error', 'Minimum deposit amount is PHP 1,000. Deposits below this amount are not allowed.')
                    ->withInput();
            }
            
            $rentalData['deposit_amount'] = $request->deposit_amount;
            $rentalData['deposit_payment_method'] = $request->deposit_payment_method ?? 'cash';
            $rentalData['deposit_payment_date'] = now();
            $rentalData['deposit_status'] = 'paid';
            $rentalData['deposit_reference_number'] = $request->deposit_reference_number;
        }

        // Create transaction record
        \App\Models\Transaction::create([
            'customer_id' => $rentalRequest->customer_id,
            'tank_id' => $rentalRequest->tank_type,
            'transaction_type' => 'Rent',
            'transaction_date' => now(),
        ]);

        \Log::info('Creating rental with data: ', $rentalData);

        $rental = Rental::create($rentalData);
        \Log::info('Created rental record: ' . $rental->id . ' with status: ' . $rental->status);

        // Create deposit record if deposit information is provided
        if ($request->has('deposit_amount') && $request->deposit_amount) {
            \App\Models\Deposit::create([
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

        return redirect()->back()->with('success', 'Rental request approved and customer notified.');
    }

    public function dispatchDelivery(RentalRequest $rentalRequest)
    {
        // Only allow dispatching of approved requests
        if ($rentalRequest->status !== 'approved') {
            return redirect()->back()->with('error', 'Only approved requests can be dispatched.');
        }

        $rentalRequest->update(['status' => 'in_transit']);

        // Log activity
        $admin = auth()->user();
        $requestType = $rentalRequest->request_type === 'refill' ? 'refill oxygen customer' : 'rental';
        \App\Models\Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'rental_dispatched',
            'description' => "Admin {$admin->name} dispatched delivery for {$rentalRequest->tank_type} to {$rentalRequest->customer->name}",
            'type' => 'info',
        ]);

        // Create notification for customer
        $customerUser = \App\Models\User::where('name', $rentalRequest->customer->name)->first();
        if ($customerUser) {
            \App\Models\Notification::create([
                'user_id' => $customerUser->id,
                'type' => 'info',
                'title' => 'Out for Delivery',
                'message' => "Your {$requestType} for {$rentalRequest->tank_type} is out for delivery",
                'link' => "/user/rentals/{$rentalRequest->id}/track",
                'read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Order has been dispatched for delivery.');
    }

    public function reject(Request $request, RentalRequest $rentalRequest)
    {
        $request->validate([
            'rejected_reason' => 'required|string|max:500'
        ]);

        $rentalRequest->update([
            'status' => 'rejected',
            'rejected_reason' => $request->rejected_reason
        ]);

        // Log activity
        $admin = auth()->user();
        $requestType = $rentalRequest->request_type === 'refill' ? 'refill oxygen customer' : 'rental';
        \App\Models\Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'rental_rejected',
            'description' => "Admin {$admin->name} rejected {$requestType} request for {$rentalRequest->tank_type} from {$rentalRequest->customer->name}. Reason: {$request->rejected_reason}",
            'type' => 'error',
        ]);

        // Create notification for customer
        $customerUser = \App\Models\User::where('name', $rentalRequest->customer->name)->first();
        if ($customerUser) {
            \App\Models\Notification::create([
                'user_id' => $customerUser->id,
                'type' => 'error',
                'title' => 'Request Rejected',
                'message' => "Your {$requestType} request for {$rentalRequest->tank_type} has been rejected",
                'link' => "/user/rentals/{$rentalRequest->id}",
                'read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Rental request rejected.');
    }

    public function show(RentalRequest $rentalRequest)
    {
        $rentalRequest->load(['customer', 'product', 'rental']);

        // Use customer address from directory table as delivery address
        if ($rentalRequest->customer && $rentalRequest->customer->address) {
            $rentalRequest->delivery_address = $rentalRequest->customer->address;
        } else {
            // Fallback to rental request address if customer address is not available
            $rentalRequest->delivery_address = $rentalRequest->address;
        }

        return Inertia::render('rentals/show', [
            'rentalRequest' => $rentalRequest,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    public function updateNotes(Request $request, RentalRequest $rentalRequest)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        $rentalRequest->update(['admin_notes' => $request->admin_notes]);

        return redirect()->back()->with('success', 'Notes updated successfully.');
    }

    public function cancel(RentalRequest $rentalRequest)
    {
        // Only allow cancellation of pending requests
        if ($rentalRequest->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending rental requests can be cancelled.');
        }

        // Update rental request status to canceled (8 chars to fit enum)
        $rentalRequest->update(['status' => 'canceled']);

        return redirect()->back()->with('success', 'Rental request canceled successfully.');
    }

    public function markAsReturned(RentalRequest $rentalRequest)
    {
        // Update rental request status to completed
        $rentalRequest->update(['status' => 'completed']);

        // Create transaction record for return
        \App\Models\Transaction::create([
            'customer_id' => $rentalRequest->customer_id,
            'tank_id' => $rentalRequest->tank_type,
            'transaction_type' => 'Returned',
            'transaction_date' => now(),
        ]);

        // Log activity
        $admin = auth()->user();
        \App\Models\Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'rental_completed',
            'description' => "Admin {$admin->name} marked rental request for {$rentalRequest->tank_type} from {$rentalRequest->customer->name} as completed",
            'type' => 'success',
        ]);

        // Create notification for customer
        $customerUser = \App\Models\User::where('name', $rentalRequest->customer->name)->first();
        if ($customerUser) {
            \App\Models\Notification::create([
                'user_id' => $customerUser->id,
                'type' => 'success',
                'title' => 'Rental Returned',
                'message' => "Your rental for {$rentalRequest->tank_type} has been marked as returned",
                'link' => "/user/rentals/{$rentalRequest->id}",
                'read' => false,
            ]);
        }

        // Update corresponding rental record if it exists
        if ($rentalRequest->rental) {
            $rentalRequest->rental->update([
                'status' => 'completed',
                'return_date' => now()
            ]);
        }

        return redirect()->back()->with('success', 'Tank marked as returned successfully.');
    }

    public function payRemainingBalance(Request $request, RentalRequest $rentalRequest)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,gcash,card',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string|max:500'
        ]);

        if (!$rentalRequest->rental) {
            return back()->with('error', 'No rental record found for this request.');
        }

        $rental = $rentalRequest->rental;
        $currentDeposit = $rental->deposit_amount ?? 0;
        $totalRentalCost = $rental->total_amount ?? 0;
        $newPaymentAmount = $request->amount;
        
        // Calculate new total deposit
        $newTotalDeposit = $currentDeposit + $newPaymentAmount;
        
        // Check if payment exceeds remaining balance
        if ($totalRentalCost > 0 && $newTotalDeposit > $totalRentalCost) {
            return back()->with('error', 'Payment amount exceeds remaining balance. Maximum payable amount is: PHP ' . ($totalRentalCost - $currentDeposit));
        }

        // Update rental deposit amount
        $rental->update([
            'deposit_amount' => $newTotalDeposit,
            'deposit_payment_method' => $request->payment_method,
            'deposit_payment_date' => now(),
            'deposit_reference_number' => $request->reference_number,
            'deposit_status' => ($newTotalDeposit >= $totalRentalCost) ? 'paid' : 'partial_paid'
        ]);

        // Create deposit record for this payment
        \App\Models\Deposit::create([
            'rental_id' => $rental->id,
            'customer_id' => $rentalRequest->customer_id,
            'amount' => $newPaymentAmount,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'status' => 'paid',
            'payment_date' => now(),
            'notes' => $request->notes,
        ]);

        // Log activity
        $admin = auth()->user();
        \App\Models\Activity::create([
            'user_id' => $admin->id,
            'customer_id' => $rentalRequest->customer_id,
            'rental_request_id' => $rentalRequest->id,
            'action' => 'remaining_balance_paid',
            'description' => "Admin {$admin->name} received payment of PHP {$newPaymentAmount} for remaining balance from {$rentalRequest->customer->name}",
            'type' => 'success',
        ]);

        // Create notification for customer
        $customerUser = \App\Models\User::where('name', $rentalRequest->customer->name)->first();
        if ($customerUser) {
            \App\Models\Notification::create([
                'user_id' => $customerUser->id,
                'type' => 'success',
                'title' => 'Payment Received',
                'message' => "Payment of PHP {$newPaymentAmount} has been received for your rental. Total deposit: PHP {$newTotalDeposit}",
                'link' => "/user/rentals/{$rentalRequest->id}",
                'read' => false,
            ]);
        }

        return back()->with('success', 'Payment received successfully. Total deposit is now PHP ' . number_format($newTotalDeposit, 2));
    }
}
