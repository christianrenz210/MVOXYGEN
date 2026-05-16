<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Transaction;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
            ->select('id', 'name', 'contact_number', 'address', 'status', 'total_rentals', 'created_at', 'updated_at', 'profile_image')
            ->with(['user:id,name,email,phone,role,profile_image,status,updated_at', 'rentalRequests' => function ($query) {
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
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'contact_number' => [
                'nullable',
                'string',
                'min:10',
            ],
            'password' => 'required|string|min:8|confirmed',
            'status' => 'required|in:active,inactive',
        ], [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        // Check if email is verified via OTP
        if (!\App\Http\Controllers\OtpController::isEmailVerified($validated['email'], 'customer_creation')) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Email verification required. Please verify your email first.']);
        }

        try {
            // Create customer record
            $customer = Customer::create([
                'name' => $validated['name'],
                'contact_number' => $validated['contact_number'] ?? '',
                'address' => '', // Empty address for now
                'status' => $validated['status'],
                'total_rentals' => 0,
                'join_date' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create user account for the customer (using same logic as registration)
            Log::info('Attempting to create user account for customer', [
                'customer_id' => $customer->id,
                'email' => $validated['email'],
                'name' => $validated['name'],
            ]);

            try {
                $user = \App\Models\User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['contact_number'] ?? null,
                    'password' => Hash::make($validated['password']),
                    'role' => 'customer',
                    'customer_id' => $customer->id,
                ]);

                Log::info('User account created successfully for customer', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'customer_id' => $customer->id,
                    'phone' => $user->phone,
                ]);

                // Verify user was actually saved
                $savedUser = \App\Models\User::find($user->id);
                if (!$savedUser) {
                    Log::error('User was not actually saved to database', [
                        'user_id' => $user->id,
                    ]);
                    throw new \Exception('User was not saved to database');
                }

            } catch (\Exception $e) {
                Log::error('Failed to create user account for customer', [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'customer_id' => $customer->id,
                    'email' => $validated['email'],
                    'trace' => $e->getTraceAsString(),
                ]);

                // Return error response
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['error' => 'Failed to create user account: ' . $e->getMessage()]);
            }

            // Clear OTP verification after successful creation
            \App\Http\Controllers\OtpController::clearEmailVerification($validated['email'], 'customer_creation');

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
                'success' => 'Customer successfully added! User account created.',
                'user_id' => $user->id,
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'href' => '/dashboard'],
                    ['title' => 'Customer Management', 'href' => '/customer']
                ],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create customer', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create customer: ' . $e->getMessage()]);
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
        $customer = Customer::with(['user:id,name,email,phone,role,profile_image,status,updated_at', 'rentalRequests' => function ($query) {
            $query->whereNotNull('address')->orderBy('created_at', 'desc')->limit(1);
        }, 'rentalRequests.rental'])->findOrFail($id);
        
        // Get customer's latest delivery address from rental requests
        $latestRentalRequest = $customer->rentalRequests->first();
        if ($latestRentalRequest && $latestRentalRequest->address) {
            $customer->delivery_address = $latestRentalRequest->address;
        } else {
            $customer->delivery_address = $customer->address;
        }
        
        // Calculate billing information
        $billingInfo = [];
        if ($customer->rentalRequests) {
            foreach ($customer->rentalRequests as $request) {
                if ($request->rental && $request->status === 'approved') {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    // Show all approved rentals, regardless of remaining balance
                    $billingInfo[] = [
                        'rental_request_id' => $request->id,
                        'tank_type' => $request->tank_type,
                        'total_amount' => $totalAmount,
                        'deposit_amount' => $depositAmount,
                        'remaining_balance' => $remainingBalance,
                        'status' => $request->status,
                        'pickup_date' => $rental->pickup_date,
                    ];
                }
            }
        }
        
        $customerData = $customer->toArray();
        $customerData['billing_info'] = $billingInfo;
        $customerData['total_outstanding_balance'] = array_sum(array_column($billingInfo, 'remaining_balance'));
        
        return response()->json($customerData);
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
                'min:10',
            ],
            'address' => 'required|string|max:500',
            'status' => 'required|in:active,inactive',
        ], [
            'contact_number.required' => 'Contact number is required.',
            'contact_number.min' => 'Contact number must be at least 10 characters.',
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

    /**
     * Permanently delete the specified customer.
     */
    public function destroy(string $id)
    {
        $customer = Customer::findOrFail($id);

        // Only allow deleting archived customers
        if ($customer->status !== 'archived') {
            return redirect()->back()->withErrors(['error' => 'Only archived customers can be permanently deleted.']);
        }

        try {
            // Delete associated user account
            if ($customer->user) {
                $customer->user->delete();
            }

            // Delete the customer (this also cascades transactions if set up)
            $customer->delete();

            return redirect()->route('customer')->with('success', 'Customer permanently deleted!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to delete customer. Please try again.']);
        }
    }
}
