<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Transaction;
use Inertia\Inertia;
use Carbon\Carbon;

class CustomerController extends Controller
{
    /**
     * Get tanks due for return (rented more than 7 days ago without return transaction)
     */
    private function getTanksDueForReturn()
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);
        
        // Get all 'Rent' transactions from the last 30 days that are older than 7 days
        $rentTransactions = Transaction::with('customer')
            ->where('transaction_type', 'Rent')
            ->where('transaction_date', '>=', Carbon::now()->subDays(30))
            ->where('transaction_date', '<=', $sevenDaysAgo)
            ->orderBy('transaction_date', 'asc')
            ->get();
        
        $tanksDue = [];
        foreach ($rentTransactions as $transaction) {
            // Check if there's a corresponding 'Returned' transaction for this tank and customer
            $hasReturn = Transaction::where('customer_id', $transaction->customer_id)
                ->where('tank_id', $transaction->tank_id)
                ->where('transaction_type', 'Returned')
                ->where('transaction_date', '>=', $transaction->transaction_date)
                ->exists();
            
            if (!$hasReturn) {
                $tanksDue[] = [
                    'id' => $transaction->id,
                    'customer_id' => $transaction->customer_id,
                    'customer_name' => $transaction->customer->name,
                    'tank_id' => $transaction->tank_id,
                    'days_overdue' => Carbon::parse($transaction->transaction_date)->diffInDays(Carbon::now()),
                    'rental_date' => $transaction->transaction_date,
                    'created_at' => $transaction->created_at,
                ];
            }
        }
        
        return $tanksDue;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch all customers except Admin with User relationship and latest delivery address
        $customersWithRentals = Customer::where('name', '!=', 'Admin')
            ->with(['user', 'rentalRequests' => function ($query) {
                $query->whereNotNull('address')
                    ->orderBy('created_at', 'desc')
                    ->limit(1);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all recent transactions (last 3 per customer)
        $allRecentTransactions = [];
        $customersWithRentals->each(function ($customer) use (&$allRecentTransactions) {
            // Get customer's latest delivery address from rental requests
            $latestRentalRequest = $customer->rentalRequests->first();
            if ($latestRentalRequest && $latestRentalRequest->address) {
                $customer->delivery_address = $latestRentalRequest->address;
            } else {
                $customer->delivery_address = $customer->address;
            }

            // Calculate actual total rentals based on approved rental requests
            $approvedRentalsCount = \App\Models\RentalRequest::where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->count();
            $customer->total_rentals = $approvedRentalsCount;

            $recentTransactions = $customer->transactions()
                ->orderBy('transaction_date', 'desc')
                ->take(10)
                ->get();

            foreach ($recentTransactions as $transaction) {
                $allRecentTransactions[] = [
                    'id' => $transaction->id,
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'tank_id' => $transaction->tank_id,
                    'transaction_type' => $transaction->transaction_type,
                    'transaction_date' => $transaction->transaction_date,
                    'created_at' => $transaction->created_at,
                ];
            }
        });

        // Sort all recent transactions by date (most recent first)
        usort($allRecentTransactions, function ($a, $b) {
            return strcmp($b['transaction_date'], $a['transaction_date']);
        });

        return Inertia::render('customer', [
            'customers' => $customersWithRentals,
            'recent_transactions' => $allRecentTransactions,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Customer Management', 'href' => '/customer']
            ],
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Remove all format requirements
        $data = $request->all();

        try {
            // Simple customer creation without format requirements
            $customer = Customer::create([
                'name' => $data['name'] ?? '',
                'contact_number' => $data['contact_number'] ?? '',
                'address' => $data['address'] ?? '',
                'status' => $data['status'] ?? 'active',
                'total_rentals' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Get updated customer list
            $customers = Customer::orderBy('created_at', 'desc')->get();
            
            // Get all recent transactions (last 3 per customer)
            $allRecentTransactions = [];
            $customers->each(function ($customer) use (&$allRecentTransactions) {
                $recentTransactions = $customer->transactions()
                    ->orderBy('transaction_date', 'desc')
                    ->take(3)
                    ->get();
                
                foreach ($recentTransactions as $transaction) {
                    $allRecentTransactions[] = [
                        'id' => $transaction->id,
                        'customer_id' => $customer->id,
                        'customer_name' => $customer->name,
                        'tank_id' => $transaction->tank_id,
                        'transaction_type' => $transaction->transaction_type,
                        'transaction_date' => $transaction->transaction_date,
                        'created_at' => $transaction->created_at,
                    ];
                }
            });
            
            // Sort all recent transactions by date (most recent first)
            usort($allRecentTransactions, function ($a, $b) {
                return strcmp($b['transaction_date'], $a['transaction_date']);
            });
            
            return Inertia::render('customer', [
                'customers' => $customers,
                'recent_transactions' => $allRecentTransactions,
                'success' => 'Customer successfully added!',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'href' => '/dashboard'],
                    ['title' => 'Customer Management', 'href' => '/customer']
                ],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create customer. Please try again.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = Customer::with('transactions')->findOrFail($id);
        
        return Inertia::render('customer-show', [
            'customer' => $customer,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $customer = Customer::findOrFail($id);
        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $customer = Customer::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => [
                'required',
                'string',
                'regex:/^09\d{2}-\d{3}-\d{4}$/',
                'min:11',
            ],
            'address' => 'required|string|max:500',
            'status' => 'required|in:active,inactive',
        ], [
            'contact_number.required' => 'Contact number is required.',
            'contact_number.regex' => 'Contact number must be in format: 09XX-XXX-XXXX',
            'contact_number.min' => 'Contact number is too short. Must be exactly 11 characters (09XX-XXX-XXXX).',
        ]);

        try {
            $customer->update($validated);
            
            // Get updated customer list
            $customers = Customer::orderBy('created_at', 'desc')->get();
            $customers->each(function ($customer) {
                $customer->recent_transactions = $customer->transactions()
                    ->orderBy('transaction_date', 'desc')
                    ->take(3)
                    ->get();
            });
            
            return Inertia::render('customer', [
                'customers' => $customers,
                'success' => 'Customer successfully updated!',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'href' => '/dashboard'],
                    ['title' => 'Customer Management', 'href' => '/customer'],
                    ['title' => 'Edit Customer', 'href' => "/customer/{$id}/edit"]
                ],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update customer. Please try again.']);
        }
    }

    /**
     * Archive the specified customer.
     */
    public function archive(string $id)
    {
        $customer = Customer::findOrFail($id);
        
        try {
            $customer->update(['status' => 'archived']);
            
            // Archive associated user account
            \App\Models\User::where('name', $customer->name)->update(['status' => 'archived']);
            
            // Get updated customer list
            $customers = Customer::orderBy('created_at', 'desc')->get();
            $customers->each(function ($customer) {
                $customer->recent_transactions = $customer->transactions()
                    ->orderBy('transaction_date', 'desc')
                    ->take(3)
                    ->get();
            });
            
            return Inertia::render('customer', [
                'customers' => $customers,
                'success' => 'Customer successfully archived!',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'href' => '/dashboard'],
                    ['title' => 'Customer Management', 'href' => '/customer']
                ],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to archive customer. Please try again.']);
        }
    }

    /**
     * Restore the specified archived customer.
     */
    public function restore(string $id)
    {
        $customer = Customer::findOrFail($id);
        
        try {
            $customer->update(['status' => 'active']);
            
            // Restore associated user account
            \App\Models\User::where('name', $customer->name)->update(['status' => 'active']);
            
            // Get updated customer list
            $customers = Customer::orderBy('created_at', 'desc')->get();
            $customers->each(function ($customer) {
                $customer->recent_transactions = $customer->transactions()
                    ->orderBy('transaction_date', 'desc')
                    ->take(3)
                    ->get();
            });
            
            return Inertia::render('customer', [
                'customers' => $customers,
                'success' => 'Customer successfully restored!',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'href' => '/dashboard'],
                    ['title' => 'Customer Management', 'href' => '/customer']
                ],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to restore customer. Please try again.']);
        }
    }
}
