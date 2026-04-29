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
        } else {
            $rentalRequests = RentalRequest::where('customer_id', $customer->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('user/rentals/index', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals']
            ],
            'rentalRequests' => $rentalRequests,
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

        return Inertia::render('user/rentals/create', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals'],
                ['title' => 'New Request', 'href' => '/user/rentals/create']
            ],
            'approved_rental_requests' => $approvedRentalRequests,
            'tankTypes' => $tankTypes,
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
            'purpose' => $request->purpose,
            'contact_number' => $request->contact_number,
            'address' => $request->address ?? 'Pickup at Store',
            'status' => 'pending',
            'priority' => $request->priority ?? 'normal',
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

        return Inertia::render('user/history', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'History', 'href' => '/user/history']
            ],
            'rentalRequests' => $rentalRequests,
            'stats' => $stats,
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

        return Inertia::render('user/settings', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'Settings', 'href' => '/user/settings']
            ],
            'user' => $user,
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
            $updateData['profile_image'] = '/storage/' . $path;

            \Log::info('Profile image uploaded successfully: ' . $updateData['profile_image']);
        }

        $user->update($updateData);

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

        return Inertia::render('user/rentals/track', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'Track Delivery', 'href' => "/user/rentals/{$rentalRequest->id}/track"]
            ],
            'rental' => $rentalData,
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

        return Inertia::render('user/rentals/edit', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals'],
                ['title' => 'Edit Request', 'href' => "/user/rentals/{$rentalRequest->id}/edit"]
            ],
            'rentalRequest' => $rentalRequest,
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
        
        // Find customer record for this user
        $customer = Customer::where('name', $user->name)->first();
        
        // Ensure user can only view their own requests
        if (!$customer || $rentalRequest->customer_id !== $customer->id) {
            abort(403);
        }

        $rentalRequest->load(['rental']);

        return Inertia::render('user/rentals/show', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/user/dashboard'],
                ['title' => 'My Rentals', 'href' => '/user/rentals'],
                ['title' => 'Request Details', 'href' => "/user/rentals/{$rentalRequest->id}"]
            ],
            'rentalRequest' => $rentalRequest,
            'auth' => [
                'user' => $user
            ]
        ]);
    }
}
