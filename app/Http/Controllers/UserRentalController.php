<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\RentalRequest;
use App\Models\Rental;
use App\Models\User;
use App\Services\GeolocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UserRentalController extends Controller
{
    protected $geolocationService;

    public function __construct(GeolocationService $geolocationService)
    {
        $this->geolocationService = $geolocationService;
    }
    public function index()
    {
        $user = Auth::user();
        
        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();
        
        if (!$customer) {
            $rentalRequests = collect([]);
            $billingInfo = [];
            $totalOutstandingBalance = 0;
        } else {
            $rentalRequests = RentalRequest::where('customer_id', $customer->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Calculate billing information
            $billingInfo = [];
            $approvedRentals = RentalRequest::with(['rental'])
                ->where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get();
            
            foreach ($approvedRentals as $request) {
                if ($request->rental) {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    if ($remainingBalance > 0) {
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
            $totalOutstandingBalance = array_sum(array_column($billingInfo, 'remaining_balance'));
        }

        return Inertia::render('user/rentals/index', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals']
            ],
            'rentalRequests' => $rentalRequests,
            'billingInfo' => $billingInfo,
            'totalOutstandingBalance' => $totalOutstandingBalance,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();

        // Get approved rental requests for this customer
        $approvedRentalRequests = [];
        if ($customer) {
            $approvedRentalRequests = RentalRequest::where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get(['tank_type'])
                ->pluck('tank_type')
                ->unique()
                ->values()
                ->toArray();
        }

        // Get available tank types from inventory with prices, quantity, and images
        $tankTypes = \App\Models\Tank::where('status', 'available')
            ->where('quantity', '>', 0)
            ->get(['tank_type', 'price', 'quantity', 'image'])
            ->map(function ($tank) {
                // Convert image path to full URL if it exists
                $imageUrl = null;
                if ($tank->image) {
                    if (str_starts_with($tank->image, 'http')) {
                        $imageUrl = $tank->image;
                    } elseif (str_starts_with($tank->image, '/storage/')) {
                        $imageUrl = asset($tank->image);
                    } else {
                        $imageUrl = Storage::url($tank->image);
                    }
                }

                return [
                    'type' => $tank->tank_type,
                    'price' => (float) $tank->price,
                    'quantity' => $tank->quantity,
                    'image' => $imageUrl
                ];
            })
            ->unique('type')
            ->values();

        // Calculate billing information
        $billingInfo = [];
        $totalOutstandingBalance = 0;
        if ($customer) {
            $approvedRentals = RentalRequest::with(['rental'])
                ->where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get();
            
            foreach ($approvedRentals as $request) {
                if ($request->rental) {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    if ($remainingBalance > 0) {
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
            $totalOutstandingBalance = array_sum(array_column($billingInfo, 'remaining_balance'));
        }

        return Inertia::render('user/rentals/create', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals'],
                ['title' => 'New Request', 'href' => '/user/rentals/create']
            ],
            'approved_rental_requests' => $approvedRentalRequests,
            'tankTypes' => $tankTypes,
            'billingInfo' => $billingInfo,
            'totalOutstandingBalance' => $totalOutstandingBalance,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'request_type' => 'required|in:rental,refill',
            'tank_type' => 'required|string|max:255',
            'purpose' => 'required|string|max:1000',
            'contact_number' => 'required|string|max:20',
            'address' => 'required_if:pickup_type,delivery|string|max:500',
            'pickup_type' => 'required|in:delivery,pickup',
            'priority' => 'required|in:low,normal,high,urgent'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $user = Auth::user();

        // Find or create customer record for this user
        $customer = Customer::firstOrCreate(
            ['name' => $user->name], // Use name as identifier since there's no user_id field
            [
                'contact_number' => $request->contact_number,
                'address' => $request->address ?? 'Pickup',
                'status' => 'active',
                'total_rentals' => 0,
                'join_date' => now(),
            ]
        );

        // Prepare rental data with required fields
        $rentalData = [
            'customer_id' => $customer->id,
            'request_type' => $request->request_type,
            'product_id' => null,
            'tank_type' => $request->tank_type,
            'quantity' => 1, // Default quantity since we removed it from form
            'start_date' => now()->format('Y-m-d'),
            'end_date' => now()->addDays(7)->format('Y-m-d'),
            'purpose' => $request->purpose,
            'contact_number' => $request->contact_number,
            'address' => $request->address ?? 'Pickup at Store',
            'status' => 'pending',
            'priority' => $request->priority ?? 'normal',
            'delivery_fee' => $request->pickup_type === 'delivery' ? ($request->delivery_fee ?? 0) : 0,
            'admin_notes' => null,
            'rejected_reason' => null
        ];

        // Handle geolocation based on pickup type
        if ($request->pickup_type === 'delivery') {
            $coordinates = $this->geolocationService->getCoordinatesFromAddress($request->address);
            if ($coordinates) {
                $rentalData['delivery_lat'] = $coordinates['lat'];
                $rentalData['delivery_lng'] = $coordinates['lng'];
                $rentalData['delivery_address'] = $coordinates['formatted_address'] ?? $request->address;
            } else {
                $rentalData['delivery_address'] = $request->address;
            }
        } else {
            // For pickup, set default pickup location (store location)
            $storeLocation = [
                'lat' => 14.5995, // Manila coordinates (replace with actual store location)
                'lng' => 120.9842,
                'address' => 'MV Oxygen Trading, Manila, Philippines'
            ];
            $rentalData['pickup_lat'] = $storeLocation['lat'];
            $rentalData['pickup_lng'] = $storeLocation['lng'];
            $rentalData['pickup_address'] = $storeLocation['address'];
        }

        // Generate tracking number
        $trackingNumber = 'MVO-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

        $rentalData['tracking_number'] = $trackingNumber;

        $rentalRequest = RentalRequest::create($rentalData);

        // Log activity
        \App\Models\Activity::create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'rental_request_id' => $rentalRequest->id,
            'action' => $request->request_type === 'refill' ? 'refill_request' : 'rental_request',
            'description' => $request->request_type === 'refill'
                ? "User {$user->name} submitted a refill customer oxygen request for {$request->tank_type}"
                : "User {$user->name} submitted a {$request->request_type} request for {$request->tank_type}",
            'type' => 'info',
        ]);

        // Create notification for admin about new request
        $adminUsers = \App\Models\User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'type' => 'info',
                'title' => 'New Rental Request',
                'message' => "New {$request->request_type} request for {$request->tank_type} from {$customer->name}",
                'link' => "/rentals/{$rentalRequest->id}",
                'read' => false,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Rental request submitted successfully!');
    }

    public function history()
    {
        $user = Auth::user();

        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();

        if ($customer) {
            $rentalRequests = RentalRequest::where('customer_id', $customer->id)
                ->with(['assignedTank', 'maintenance'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $rentalRequests = collect([]);
        }

        // Calculate stats
        $stats = [
            'total_requests' => $rentalRequests->count(),
            'pending_requests' => $rentalRequests->where('status', 'pending')->count(),
            'approved_requests' => $rentalRequests->where('status', 'approved')->count(),
            'rejected_requests' => $rentalRequests->where('status', 'rejected')->count(),
            'completed_requests' => $rentalRequests->where('status', 'completed')->count(),
        ];

        // Calculate billing information
        $billingInfo = [];
        $totalOutstandingBalance = 0;
        if ($customer) {
            $approvedRentals = RentalRequest::with(['rental'])
                ->where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get();
            
            foreach ($approvedRentals as $request) {
                if ($request->rental) {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    if ($remainingBalance > 0) {
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
            $totalOutstandingBalance = array_sum(array_column($billingInfo, 'remaining_balance'));
        }

        return Inertia::render('user/history', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'History', 'href' => '/user/history']
            ],
            'rentalRequests' => $rentalRequests,
            'stats' => $stats,
            'billingInfo' => $billingInfo,
            'totalOutstandingBalance' => $totalOutstandingBalance,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function clearHistory()
    {
        $user = Auth::user();

        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();

        if ($customer) {
            // Delete only completed, rejected, and cancelled requests
            // Keep pending and approved requests
            RentalRequest::where('customer_id', $customer->id)
                ->whereIn('status', ['completed', 'rejected', 'cancelled'])
                ->delete();
        }

        return redirect()->route('user.history')
            ->with('success', 'History cleared successfully!');
    }

    public function settings()
    {
        $user = Auth::user()->fresh();

        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();

        // Calculate billing information
        $billingInfo = [];
        $totalOutstandingBalance = 0;
        if ($customer) {
            $approvedRentals = RentalRequest::with(['rental'])
                ->where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get();
            
            foreach ($approvedRentals as $request) {
                if ($request->rental) {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    if ($remainingBalance > 0) {
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
            $totalOutstandingBalance = array_sum(array_column($billingInfo, 'remaining_balance'));
        }

        return Inertia::render('user/settings', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'Settings', 'href' => '/user/settings']
            ],
            'user' => $user,
            'billingInfo' => $billingInfo,
            'totalOutstandingBalance' => $totalOutstandingBalance,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
        ];

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            \Log::info('Profile image upload attempt for user: ' . $user->id);

            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('profile-images')) {
                Storage::disk('public')->makeDirectory('profile-images');
                \Log::info('Created profile-images directory');
            }

            // Delete old profile image if exists
            if ($user->profile_image) {
                $oldPath = str_replace('/storage/', '', $user->profile_image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                    \Log::info('Deleted old profile image: ' . $oldPath);
                }
            }

            $file = $request->file('profile_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('profile-images', $filename, 'public');
            $updateData['profile_image'] = $path;

            \Log::info('Profile image uploaded successfully: ' . $updateData['profile_image']);
        }

        $user->update($updateData);

        // Update customer profile_image if customer exists
        $customer = \App\Models\Customer::where('name', $user->name)->first();
        if ($customer && isset($updateData['profile_image'])) {
            $customer->update(['profile_image' => $updateData['profile_image']]);
            \Log::info('Updated customer profile_image: ' . $customer->id);
        }

        // Refresh user in session
        Auth::setUser($user->fresh());

        return redirect()->route('user.settings')
            ->with('success', 'Profile updated successfully!');
    }

    public function updateNotifications(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
        ]);

        // Store notification preferences in user metadata or separate table
        // For now, we'll store in session as placeholder
        session(['notification_preferences' => $validated]);

        return redirect()->route('user.settings')
            ->with('success', 'Notification preferences updated!');
    }

    public function updatePreferences(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'theme' => 'required|string|in:light,dark,system',
            'language' => 'required|string|in:en,tl',
            'timezone' => 'required|string',
        ]);

        // Store preferences in session or user metadata
        session(['user_preferences' => $validated]);

        return redirect()->route('user.settings')
            ->with('success', 'Preferences updated!');
    }

    public function usersIndex()
    {
        $users = User::select('id', 'name', 'email', 'role', 'status', 'created_at')->get();

        return Inertia::render('users/index', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'User Management', 'href' => '/users']
            ],
            'users' => $users,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function archiveUser($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'archived';
        $user->save();

        return redirect()->route('users.index')
            ->with('success', 'User archived successfully');
    }

    public function restoreUser($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'active';
        $user->save();

        return redirect()->route('users.index')
            ->with('success', 'User restored successfully');
    }

    public function track(RentalRequest $rentalRequest)
    {
        $user = Auth::user();
        
        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();
        
        // Ensure user can only track their own requests
        if (!$customer || $rentalRequest->customer_id !== $customer->id) {
            abort(403);
        }

        // Prepare rental data with location information
        $rentalData = [
            'id' => $rentalRequest->id,
            'tank_type' => $rentalRequest->tank_type,
            'status' => $rentalRequest->status,
            'pickup_type' => $rentalRequest->delivery_address ? 'delivery' : 'pickup',
            'created_at' => $rentalRequest->created_at,
        ];

        // Add location data if available
        if ($rentalRequest->delivery_address) {
            $rentalData['delivery_location'] = [
                'lat' => $rentalRequest->delivery_lat,
                'lng' => $rentalRequest->delivery_lng,
                'address' => $rentalRequest->delivery_address
            ];
        }

        if ($rentalRequest->pickup_address) {
            $rentalData['pickup_location'] = [
                'lat' => $rentalRequest->pickup_lat,
                'lng' => $rentalRequest->pickup_lng,
                'address' => $rentalRequest->pickup_address
            ];
        }

        if ($rentalRequest->current_lat && $rentalRequest->current_lng) {
            $rentalData['current_location'] = [
                'lat' => $rentalRequest->current_lat,
                'lng' => $rentalRequest->current_lng
            ];
        }

        // Calculate billing information for sidebar
        $billingInfo = [];
        $totalOutstandingBalance = 0;
        if ($customer) {
            $approvedRentals = RentalRequest::with(['rental'])
                ->where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get();
            
            foreach ($approvedRentals as $request) {
                if ($request->rental) {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    if ($remainingBalance > 0) {
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
            $totalOutstandingBalance = array_sum(array_column($billingInfo, 'remaining_balance'));
        }

        return Inertia::render('user/rentals/track', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'Track Delivery', 'href' => "/user/rentals/{$rentalRequest->id}/track"]
            ],
            'rental' => $rentalData,
            'billingInfo' => $billingInfo,
            'totalOutstandingBalance' => $totalOutstandingBalance,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function edit(RentalRequest $rentalRequest)
    {
        $user = Auth::user();

        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();

        // Ensure user can only edit their own requests
        if (!$customer || $rentalRequest->customer_id !== $customer->id) {
            abort(403);
        }

        // Only allow editing pending requests
        if ($rentalRequest->status !== 'pending') {
            return redirect()->route('user.rentals.show', $rentalRequest)
                ->with('error', 'You can only edit pending requests.');
        }

        // Get approved rental requests for this customer
        $approvedRentalRequests = [];
        if ($customer) {
            $approvedRentalRequests = RentalRequest::where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get(['tank_type'])
                ->pluck('tank_type')
                ->unique()
                ->values()
                ->toArray();
        }

        // Get available tank types from inventory with prices, quantity, and images
        $tankTypes = \App\Models\Tank::where('status', 'available')
            ->where('quantity', '>', 0)
            ->get(['tank_type', 'price', 'quantity', 'image'])
            ->map(function ($tank) {
                // Convert image path to full URL if it exists
                $imageUrl = null;
                if ($tank->image) {
                    if (str_starts_with($tank->image, 'http')) {
                        $imageUrl = $tank->image;
                    } elseif (str_starts_with($tank->image, '/storage/')) {
                        $imageUrl = asset($tank->image);
                    } else {
                        $imageUrl = Storage::url($tank->image);
                    }
                }

                return [
                    'type' => $tank->tank_type,
                    'price' => (float) $tank->price,
                    'quantity' => $tank->quantity,
                    'image' => $imageUrl
                ];
            })
            ->unique('type')
            ->values();

        // Load assigned tank with image
        $rentalRequest->load('assignedTank');

        // Also load tank by tank_type if assigned_tank is not set
        if (!$rentalRequest->assignedTank && $rentalRequest->tank_type) {
            $tank = \App\Models\Tank::where('tank_type', $rentalRequest->tank_type)->first();
            if ($tank) {
                $rentalRequest->assigned_tank = $tank;
            }
        }

        // Convert image path to full URL if it exists
        if ($rentalRequest->assigned_tank && $rentalRequest->assigned_tank->image) {
            if (!str_starts_with($rentalRequest->assigned_tank->image, 'http')) {
                $rentalRequest->assigned_tank->image = \Storage::url($rentalRequest->assigned_tank->image);
            }
        }

        // Calculate billing information
        $billingInfo = [];
        $totalOutstandingBalance = 0;
        if ($customer) {
            $approvedRentals = RentalRequest::with(['rental'])
                ->where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get();
            
            foreach ($approvedRentals as $request) {
                if ($request->rental) {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    if ($remainingBalance > 0) {
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
            $totalOutstandingBalance = array_sum(array_column($billingInfo, 'remaining_balance'));
        }

        return Inertia::render('user/rentals/edit', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals'],
                ['title' => 'Edit Request', 'href' => "/user/rentals/{$rentalRequest->id}/edit"]
            ],
            'rentalRequest' => $rentalRequest,
            'tankTypes' => $tankTypes,
            'approved_rental_requests' => $approvedRentalRequests,
            'billingInfo' => $billingInfo,
            'totalOutstandingBalance' => $totalOutstandingBalance,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function update(Request $request, RentalRequest $rentalRequest)
    {
        $user = Auth::user();

        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();

        // Ensure user can only update their own requests
        if (!$customer || $rentalRequest->customer_id !== $customer->id) {
            abort(403);
        }

        // Only allow updating pending requests
        if ($rentalRequest->status !== 'pending') {
            return redirect()->route('user.rentals.show', $rentalRequest)
                ->with('error', 'You can only update pending requests.');
        }

        $validator = Validator::make($request->all(), [
            'request_type' => 'required|in:rental,refill',
            'tank_type' => 'required|string|max:255',
            'purpose' => 'required|string|max:1000',
            'contact_number' => 'required|string|max:20',
            'address' => 'required_if:pickup_type,delivery|string|max:500',
            'pickup_type' => 'required|in:delivery,pickup'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Prepare rental data
        $rentalData = [
            'request_type' => $request->request_type,
            'tank_type' => $request->tank_type,
            'purpose' => $request->purpose,
            'contact_number' => $request->contact_number,
            'address' => $request->address ?? 'Pickup at Store',
            'delivery_fee' => $request->pickup_type === 'delivery' ? ($request->delivery_fee ?? 0) : 0,
        ];

        // Handle geolocation based on pickup type
        if ($request->pickup_type === 'delivery') {
            $coordinates = $this->geolocationService->getCoordinatesFromAddress($request->address);
            if ($coordinates) {
                $rentalData['delivery_lat'] = $coordinates['lat'];
                $rentalData['delivery_lng'] = $coordinates['lng'];
                $rentalData['delivery_address'] = $coordinates['formatted_address'] ?? $request->address;
            } else {
                $rentalData['delivery_address'] = $request->address;
            }
        } else {
            // For pickup, set default pickup location (store location)
            $storeLocation = [
                'lat' => 14.5995, // Manila coordinates (replace with actual store location)
                'lng' => 120.9842,
                'address' => 'MV Oxygen Trading, Manila, Philippines'
            ];
            $rentalData['pickup_lat'] = $storeLocation['lat'];
            $rentalData['pickup_lng'] = $storeLocation['lng'];
            $rentalData['pickup_address'] = $storeLocation['address'];
        }

        $rentalRequest->update($rentalData);

        return redirect()->route('user.rentals.show', $rentalRequest)
            ->with('success', 'Rental request updated successfully!');
    }

    public function cancel(RentalRequest $rentalRequest)
    {
        $user = Auth::user();
        
        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();
        
        // Ensure user can only cancel their own requests
        if (!$customer || $rentalRequest->customer_id !== $customer->id) {
            abort(403);
        }

        // Only allow canceling pending requests
        if ($rentalRequest->status !== 'pending') {
            return redirect()->route('user.rentals.show', $rentalRequest)
                ->with('error', 'You can only cancel pending requests.');
        }

        $rentalRequest->update([
            'status' => 'cancelled',
            'rejected_reason' => 'Cancelled by customer'
        ]);

        return redirect()->route('user.rentals.index')
            ->with('success', 'Rental request cancelled successfully!');
    }

    public function show(RentalRequest $rentalRequest)
    {
        $user = Auth::user();
        
        // Find customer record for this user (try by name or contact number)
        $customer = Customer::where('name', $user->name)
            ->orWhere('contact_number', $user->phone)
            ->first();
        
        // Ensure user can only view their own requests
        if (!$customer) {
            abort(403, 'Customer record not found. Please contact support.');
        }
        
        if ($rentalRequest->customer_id !== $customer->id) {
            abort(403, 'You do not have permission to view this rental request.');
        }

        // Calculate billing info for this specific rental
        $billingInfo = [];
        if ($rentalRequest->rental) {
            $rental = $rentalRequest->rental;
            $totalAmount = $rental->total_amount ?? 0;
            $depositAmount = $rental->deposit_amount ?? 0;
            $remainingBalance = max($totalAmount - $depositAmount, 0);
            
            // Get payment history for this rental
            $paymentHistory = \App\Models\Deposit::where('rental_id', $rental->id)
                ->where('status', 'paid')
                ->orderBy('payment_date', 'desc')
                ->get()
                ->toArray();
            
            // Always show billing info regardless of remaining balance
            $billingInfo = [
                'total_amount' => $totalAmount,
                'deposit_amount' => $depositAmount,
                'remaining_balance' => $remainingBalance,
                'deposit_status' => $rental->deposit_status ?? 'pending',
                'payment_history' => $paymentHistory,
            ];
        }
        
        if ($customer) {
            $approvedRentals = RentalRequest::with(['rental'])
                ->where('customer_id', $customer->id)
                ->where('status', 'approved')
                ->get();
            
            foreach ($approvedRentals as $request) {
                if ($request->rental) {
                    $rental = $request->rental;
                    $totalAmount = $rental->total_amount ?? 0;
                    $depositAmount = $rental->deposit_amount ?? 0;
                    $remainingBalance = max($totalAmount - $depositAmount, 0);
                    
                    if ($remainingBalance > 0) {
                        $sidebarBillingInfo[] = [
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
            $totalOutstandingBalance = array_sum(array_column($sidebarBillingInfo, 'remaining_balance'));
        }

        return Inertia::render('user/rentals/show', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals'],
                ['title' => 'Request Details', 'href' => "/user/rentals/{$rentalRequest->id}"]
            ],
            'rentalRequest' => $rentalRequest,
            'billingInfo' => $billingInfo,
            'totalOutstandingBalance' => $totalOutstandingBalance,
            'auth' => [
                'user' => $user
            ]
        ]);
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
        
        $newTotalDeposit = $currentDeposit + $newPaymentAmount;
        
        if ($totalRentalCost > 0 && $newTotalDeposit > $totalRentalCost) {
            return back()->with('error', 'Payment amount exceeds remaining balance. Maximum payable amount is: PHP ' . ($totalRentalCost - $currentDeposit));
        }

        // Generate transaction ID
        $transactionId = 'TXN-' . strtoupper(uniqid()) . '-' . date('Ymd');

        $rental->update([
            'deposit_amount' => $newTotalDeposit,
            'deposit_payment_method' => $request->payment_method,
            'deposit_payment_date' => now(),
            'deposit_reference_number' => $request->reference_number,
            'deposit_status' => ($newTotalDeposit >= $totalRentalCost) ? 'paid' : 'partial_paid'
        ]);

        $deposit = \App\Models\Deposit::create([
            'rental_id' => $rental->id,
            'customer_id' => $rentalRequest->customer_id,
            'amount' => $newPaymentAmount,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'status' => 'paid',
            'payment_date' => now(),
            'notes' => $request->notes,
            'transaction_id' => $transactionId,
        ]);

        \Log::info('Payment recorded for rental', [
            'rental_id' => $rental->id,
            'rental_request_id' => $rentalRequest->id,
            'customer_id' => $rentalRequest->customer_id,
            'amount' => $newPaymentAmount,
            'payment_method' => $request->payment_method,
            'transaction_id' => $transactionId,
        ]);

        return back()->with('success', 'Payment recorded successfully!')->with('transaction_id', $transactionId);
    }
}
