<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\RefillController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\UserRentalController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\SupplierOrderController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/faq', function () {
    return Inertia::render('faq');
})->name('faq');

Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

Route::middleware(['auth'])->group(function () {
    // User Dashboard Routes
    Route::get('user/dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');
    Route::get('user/dashboard-test', function () {
        return Inertia::render('user/dashboard-test');
    })->name('user.dashboard.test');
    
    // User Rental Routes
    Route::get('user/rentals', [UserRentalController::class, 'index'])->name('user.rentals.index');
    Route::get('user/rentals/create', [UserRentalController::class, 'create'])->name('user.rentals.create');
    Route::post('user/rentals', [UserRentalController::class, 'store'])->name('user.rentals.store');
    Route::get('user/rentals/{rentalRequest}', [UserRentalController::class, 'show'])->name('user.rentals.show');
    Route::get('user/rentals/{rentalRequest}/edit', [UserRentalController::class, 'edit'])->name('user.rentals.edit');
    Route::put('user/rentals/{rentalRequest}', [UserRentalController::class, 'update'])->name('user.rentals.update');
    Route::post('user/rentals/{rentalRequest}/update-image', [UserRentalController::class, 'updateImage'])->name('user.rentals.update-image');
    Route::post('user/rentals/{rentalRequest}/cancel', [UserRentalController::class, 'cancel'])->name('user.rentals.cancel');
    Route::get('user/rentals/{rentalRequest}/track', [UserRentalController::class, 'track'])->name('user.rentals.track');
    Route::get('user/history', [UserRentalController::class, 'history'])->name('user.history');
    Route::post('user/history/clear', [UserRentalController::class, 'clearHistory'])->name('user.history.clear');
    Route::get('user/settings', [UserRentalController::class, 'settings'])->name('user.settings');
    Route::post('user/settings/profile', [UserRentalController::class, 'updateProfile'])->name('user.settings.profile');
    Route::post('user/settings/notifications', [UserRentalController::class, 'updateNotifications'])->name('user.settings.notifications');
    Route::post('user/settings/preferences', [UserRentalController::class, 'updatePreferences'])->name('user.settings.preferences');
    
    // Admin Dashboard Routes
    Route::get('dashboard', function () {
        $page = request()->get('rental_page', 1);
        $perPage = 2;
        $period = request()->get('period', 'daily');
        $month = request()->get('month', null); // Format: YYYY-MM

        // Fetch latest activities
        $activities = \App\Models\Activity::with(['user', 'customer', 'rentalRequest'])
            ->latest()
            ->limit(20)
            ->get();

        // Calculate rental statistics based on period
        $query = \App\Models\RentalRequest::query();

        switch ($period) {
            case 'daily':
                $query->whereDate('created_at', today());
                break;
            case 'weekly':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'monthly':
                if ($month) {
                    $query->whereYear('created_at', substr($month, 0, 4))
                          ->whereMonth('created_at', substr($month, 5, 2));
                } else {
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                }
                break;
        }

        $pendingCount = (clone $query)->where('status', 'pending')->count();
        $approvedCount = (clone $query)->where('status', 'approved')->count();
        $rejectedCount = (clone $query)->where('status', 'rejected')->count();
        $completedCount = (clone $query)->where('status', 'completed')->count();

        $pendingRentalRequestsQuery = \App\Models\RentalRequest::with(['customer'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc');

        $totalPending = $pendingRentalRequestsQuery->count();
        $pendingRentalRequests = $pendingRentalRequestsQuery
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return Inertia::render('dashboard', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard']
            ],
            'activities' => $activities,
            'rentalStats' => [
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
                'completed' => $completedCount,
            ],
            'pendingRentalRequests' => $pendingRentalRequests,
            'rentalPagination' => [
                'currentPage' => $page,
                'totalPages' => ceil($totalPending / $perPage),
                'hasNext' => $page < ceil($totalPending / $perPage),
                'hasPrev' => $page > 1
            ],
            'tanks' => \App\Models\Tank::orderBy('tank_type')->get(),
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    })->name('dashboard');
    
    // Customer Routes
    Route::get('customer', [CustomerController::class, 'index'])->name('customer');
    Route::get('customer/{id}', [CustomerController::class, 'show'])->name('customer.show');
    Route::post('customer', [CustomerController::class, 'store'])->name('customer.store');
    Route::get('customer/{id}/edit', [CustomerController::class, 'edit'])->name('customer.edit');
    Route::put('customer/{id}', [CustomerController::class, 'update'])->name('customer.update');
    Route::post('customer/{id}/archive', [CustomerController::class, 'archive'])->name('customer.archive');
    Route::post('customer/{id}/restore', [CustomerController::class, 'restore'])->name('customer.restore');
    
    // Activity Routes
    Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');
    
    // Rental Routes
    Route::get('rentals', [RentalController::class, 'index'])->name('rentals.index');
    Route::get('rentals/{rentalRequest}', [RentalController::class, 'show'])->name('rentals.show');

    // Refill Routes
    Route::get('refills', [RefillController::class, 'index'])->name('refills.index');
    Route::get('refills/{rentalRequest}', [RefillController::class, 'show'])->name('refills.show');
    Route::post('refills', [RefillController::class, 'store'])->name('refills.store');
    Route::post('refills/{rentalRequest}/approve', [RefillController::class, 'approve'])->name('refills.approve');
    Route::post('refills/{rentalRequest}/reject', [RefillController::class, 'reject'])->name('refills.reject');
    Route::post('refills/{rentalRequest}/return', [RefillController::class, 'markAsReturned'])->name('refills.return');
    Route::put('refills/{rentalRequest}/notes', [RefillController::class, 'updateNotes'])->name('refills.update-notes');

    // Supplier Routes
    Route::get('suppliers', [SupplierController::class, 'index'])->name('suppliers.index');

    // Admin Settings Route
    Route::get('admin/settings', [AdminController::class, 'settings'])->name('admin.settings');
    Route::post('admin/settings/profile', [AdminController::class, 'updateProfile'])->name('admin.settings.profile');
    Route::post('admin/settings/profile-image', [AdminController::class, 'updateProfileImage'])->name('admin.settings.profile.image');
    Route::post('admin/backup', [AdminController::class, 'backup'])->name('admin.backup');
    Route::post('admin/restore', [AdminController::class, 'restore'])->name('admin.restore');
    Route::get('admin/backups', [AdminController::class, 'listBackups'])->name('admin.backups.list');
    Route::get('admin/backups/{filename}/download', [AdminController::class, 'downloadBackup'])->name('admin.backups.download');
    Route::delete('admin/backups/{filename}', [AdminController::class, 'deleteBackup'])->name('admin.backups.delete');

    // User Management Routes
    Route::get('users', [UserRentalController::class, 'usersIndex'])->name('users.index');
    Route::post('users/{id}/archive', [UserRentalController::class, 'archiveUser'])->name('users.archive');
    Route::post('users/{id}/restore', [UserRentalController::class, 'restoreUser'])->name('users.restore');
    Route::get('suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
    Route::post('suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::get('suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit');
    Route::put('suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // Deposit Routes
    Route::post('deposits', [DepositController::class, 'store'])->name('deposits.store');
    Route::put('deposits/{deposit}', [DepositController::class, 'update'])->name('deposits.update');
    Route::delete('deposits/{deposit}', [DepositController::class, 'destroy'])->name('deposits.destroy');
    Route::post('rentals/{rental}/deposit', [DepositController::class, 'updateRentalDeposit'])->name('rentals.deposit.update');

    // Inventory Routes
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::put('inventory/{tank}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::post('inventory/maintenance', [InventoryController::class, 'storeMaintenance'])->name('inventory.maintenance.store');
    Route::post('inventory/maintenance/{maintenance}/complete', [InventoryController::class, 'completeMaintenance'])->name('inventory.maintenance.complete');

    // Supplier Order Routes (Admin)
    Route::get('admin/supplier-orders', [SupplierOrderController::class, 'index'])->name('admin.supplier-orders.index');
    Route::post('admin/supplier-orders', [SupplierOrderController::class, 'store'])->name('admin.supplier-orders.store');
    Route::post('admin/supplier-orders/{order}/receive', [SupplierOrderController::class, 'receive'])->name('admin.supplier-orders.receive');
    Route::post('admin/supplier-orders/{order}/cancel', [SupplierOrderController::class, 'cancel'])->name('admin.supplier-orders.cancel');
    Route::put('admin/supplier-orders/{order}/payment', [SupplierOrderController::class, 'updatePayment'])->name('admin.supplier-orders.payment');

    // Supplier Order Routes (Supplier)
    Route::get('supplier/dashboard', [SupplierOrderController::class, 'supplierIndex'])->name('supplier.dashboard');
    Route::get('supplier/orders', [SupplierOrderController::class, 'supplierOrders'])->name('supplier.orders');
    Route::post('supplier/orders/{order}/ship', [SupplierOrderController::class, 'ship'])->name('supplier.orders.ship');
    Route::post('supplier/orders/{order}/cancel', [SupplierOrderController::class, 'cancel'])->name('supplier.orders.cancel');

    // Rental Routes (Approve, Reject, etc.)
    Route::post('rentals/{rentalRequest}/approve', [RentalController::class, 'approve'])->name('rentals.approve');
    Route::post('rentals/{rentalRequest}/reject', [RentalController::class, 'reject'])->name('rentals.reject');
    Route::post('rentals/{rentalRequest}/cancel', [RentalController::class, 'cancel'])->name('rentals.cancel');
    Route::post('rentals/{rentalRequest}/return', [RentalController::class, 'markAsReturned'])->name('rentals.return');
    Route::put('rentals/{rentalRequest}/notes', [RentalController::class, 'updateNotes'])->name('rentals.update-notes');
    
    // Notification Routes
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    
    // Reports Route
    Route::get('reports', function () {
        $period = request('period', 'monthly'); // daily, weekly, monthly
        
        $chartData = collect();
        
        if ($period === 'daily') {
            // Last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dayName = $date->format('D'); // Mon, Tue, etc.
                
                $rentalCount = \App\Models\Rental::whereDate('created_at', $date->toDateString())
                    ->count();
                
                $salesTotal = \App\Models\Rental::whereDate('created_at', $date->toDateString())
                    ->sum('total_amount') ?? 0;
                
                $refillCount = \App\Models\RentalRequest::whereDate('created_at', $date->toDateString())
                    ->count();
                
                $chartData->push([
                    'label' => $dayName,
                    'rentals' => $rentalCount,
                    'sales' => (float) $salesTotal,
                    'refills' => $refillCount
                ]);
            }
        } elseif ($period === 'weekly') {
            // Last 4 weeks
            for ($i = 3; $i >= 0; $i--) {
                $startOfWeek = now()->subWeeks($i)->startOfWeek();
                $endOfWeek = now()->subWeeks($i)->endOfWeek();
                $weekLabel = 'Week ' . now()->subWeeks($i)->weekOfYear;
                
                $rentalCount = \App\Models\Rental::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->count();
                
                $salesTotal = \App\Models\Rental::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->sum('total_amount') ?? 0;
                
                $refillCount = \App\Models\RentalRequest::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->count();
                
                $chartData->push([
                    'label' => $weekLabel,
                    'rentals' => $rentalCount,
                    'sales' => (float) $salesTotal,
                    'refills' => $refillCount
                ]);
            }
        } else {
            // Monthly - Last 6 months (default)
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthName = $date->format('M');
                
                $rentalCount = \App\Models\Rental::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();
                
                $salesTotal = \App\Models\Rental::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->sum('total_amount') ?? 0;
                
                $refillCount = \App\Models\RentalRequest::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();
                
                $chartData->push([
                    'label' => $monthName,
                    'rentals' => $rentalCount,
                    'sales' => (float) $salesTotal,
                    'refills' => $refillCount
                ]);
            }
        }
        
        // Calculate totals based on period
        if ($period === 'daily') {
            $totalRentals = \App\Models\Rental::whereDate('created_at', '>=', now()->subDays(7))->count();
            $totalSales = \App\Models\Rental::whereDate('created_at', '>=', now()->subDays(7))->sum('total_amount') ?? 0;
            $currentPeriodRentals = \App\Models\Rental::whereDate('created_at', today())->count();
            $currentPeriodSales = \App\Models\Rental::whereDate('created_at', today())->sum('total_amount') ?? 0;
        } elseif ($period === 'weekly') {
            $totalRentals = \App\Models\Rental::whereBetween('created_at', [now()->subWeeks(4)->startOfWeek(), now()])->count();
            $totalSales = \App\Models\Rental::whereBetween('created_at', [now()->subWeeks(4)->startOfWeek(), now()])->sum('total_amount') ?? 0;
            $currentPeriodRentals = \App\Models\Rental::whereBetween('created_at', [now()->startOfWeek(), now()])->count();
            $currentPeriodSales = \App\Models\Rental::whereBetween('created_at', [now()->startOfWeek(), now()])->sum('total_amount') ?? 0;
        } else {
            $totalRentals = \App\Models\Rental::count();
            $totalSales = \App\Models\Rental::sum('total_amount') ?? 0;
            $currentPeriodRentals = \App\Models\Rental::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count();
            $currentPeriodSales = \App\Models\Rental::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount') ?? 0;
        }
        
        // Get cylinder distribution data from tanks - show current inventory stock only
        $cylinderDistribution = \App\Models\Tank::select('tank_type')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->groupBy('tank_type')
            ->orderBy('total_quantity', 'desc')
            ->get()
            ->map(function ($tank, $index) {
                $colors = ['#3b82f6', '#22c55e', '#f59e0b', '#6b7280', '#8b5cf6', '#ef4444'];
                return [
                    'name' => $tank->tank_type,
                    'quantity' => (int) $tank->total_quantity,
                    'color' => $colors[$index % count($colors)]
                ];
            });
        
        return Inertia::render('reports/index', [
            'chartData' => $chartData,
            'totalRentals' => $totalRentals,
            'totalSales' => (float) $totalSales,
            'currentPeriodRentals' => $currentPeriodRentals,
            'currentPeriodSales' => (float) $currentPeriodSales,
            'cylinderDistribution' => $cylinderDistribution,
            'currentPeriod' => $period
        ]);
    })->name('reports');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
