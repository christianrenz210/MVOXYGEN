<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\RefillController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\UserRentalController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\SupplierOrderController;
use App\Http\Controllers\PurchaseOrderController;

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
    
    // Cashier Routes
    Route::get('cashier', [CashierController::class, 'index'])->name('cashier.index');
    Route::post('cashier/process', [CashierController::class, 'processSale'])->name('cashier.process');
    
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

    // Purchase Order Routes
    Route::get('purchase-order', [PurchaseOrderController::class, 'index'])->name('purchase-order.index');
    Route::post('purchase-order', [PurchaseOrderController::class, 'store'])->name('purchase-order.store');
    Route::post('purchase-order/{order}/ship', [PurchaseOrderController::class, 'ship'])->name('purchase-order.ship');
    Route::post('purchase-order/{order}/receive', [PurchaseOrderController::class, 'receiveItems'])->name('purchase-order.receive');

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
    
    // Supplier Products Routes
    Route::get('supplier/products', [SupplierOrderController::class, 'supplierProducts'])->name('supplier.products');
    Route::post('supplier/products', [SupplierOrderController::class, 'storeProduct'])->name('supplier.products.store');
    Route::put('supplier/products/{product}', [SupplierOrderController::class, 'updateProduct'])->name('supplier.products.update');
    Route::delete('supplier/products/{product}', [SupplierOrderController::class, 'destroyProduct'])->name('supplier.products.destroy');

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
        $period = request('period', 'monthly');
        $compareMode = request('compare', 'none');
        $customStartDate = request('start_date');
        $customEndDate = request('end_date'); // daily, weekly, monthly
        
        $chartData = collect();
        $tableData = collect();
        
        if ($period === 'daily') {
            // Last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dayName = $date->format('D'); // Mon, Tue, etc.
                
                $rentalCount = \App\Models\Rental::whereDate('created_at', $date->toDateString())
                    ->count();
                
                $salesTotal = \App\Models\Sale::whereDate('created_at', $date->toDateString())
                    ->sum('total_amount') ?? 0;
                
                $refillCount = \App\Models\RentalRequest::whereDate('created_at', $date->toDateString())
                    ->count();
                
                $chartData->push([
                    'label' => $dayName,
                    'rentals' => $rentalCount,
                    'sales' => (float) $salesTotal,
                    'refills' => $refillCount
                ]);
                
                // Get detailed data for tables
                $rentals = \App\Models\Rental::whereDate('created_at', $date->toDateString())
                    ->with(['customer', 'tank', 'rentalRequest'])
                    ->get();
                    
                foreach ($rentals as $rental) {
                    $tankType = 'N/A';
                    if ($rental->tank && $rental->tank->tank_type) {
                        $tankType = $rental->tank->tank_type;
                    } elseif ($rental->rentalRequest && $rental->rentalRequest->tank_type) {
                        $tankType = $rental->rentalRequest->tank_type;
                    }
                    
                    $tableData->push([
                        'period' => $dayName,
                        'type' => 'rental',
                        'customer_name' => $rental->customer->name ?? 'Unknown',
                        'amount' => $rental->total_amount ?? 0,
                        'tank_type' => $tankType
                    ]);
                }
                
                $sales = \App\Models\Sale::whereDate('created_at', $date->toDateString())
                    ->with('user')
                    ->get();
                    
                foreach ($sales as $sale) {
                    $tankType = 'N/A';
                    if (isset($sale->items[0]['tank_type'])) {
                        $tankType = $sale->items[0]['tank_type'];
                    }
                    
                    $tableData->push([
                        'period' => $dayName,
                        'full_date' => $sale->created_at->format('M d, Y'),
                        'type' => 'sale',
                        'customer_name' => $sale->customer_name,
                        'amount' => $sale->total_amount,
                        'tank_type' => $tankType
                    ]);
                }
                
                $refills = \App\Models\RentalRequest::whereDate('created_at', $date->toDateString())
                    ->with('customer')
                    ->get();
                    
                foreach ($refills as $refill) {
                    $tableData->push([
                        'period' => $dayName,
                        'type' => 'refill',
                        'customer_name' => $refill->customer->name ?? 'Unknown',
                        'amount' => 0,
                        'tank_type' => $refill->tank_type ?? 'N/A'
                    ]);
                }
            }
        } elseif ($period === 'weekly') {
            // Last 4 weeks
            for ($i = 3; $i >= 0; $i--) {
                $startOfWeek = now()->subWeeks($i)->startOfWeek();
                $endOfWeek = now()->subWeeks($i)->endOfWeek();
                $weekLabel = 'Week ' . now()->subWeeks($i)->weekOfYear;
                
                $rentalCount = \App\Models\Rental::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->count();
                
                $salesTotal = \App\Models\Sale::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->sum('total_amount') ?? 0;
                
                $refillCount = \App\Models\RentalRequest::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->count();
                
                $chartData->push([
                    'label' => $weekLabel,
                    'rentals' => $rentalCount,
                    'sales' => (float) $salesTotal,
                    'refills' => $refillCount
                ]);
                
                // Get detailed data for tables
                $rentals = \App\Models\Rental::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->with(['customer', 'tank', 'rentalRequest'])
                    ->get();
                    
                foreach ($rentals as $rental) {
                    $tankType = 'N/A';
                    if ($rental->tank && $rental->tank->tank_type) {
                        $tankType = $rental->tank->tank_type;
                    } elseif ($rental->rentalRequest && $rental->rentalRequest->tank_type) {
                        $tankType = $rental->rentalRequest->tank_type;
                    }
                    
                    $tableData->push([
                        'period' => $weekLabel,
                        'type' => 'rental',
                        'customer_name' => $rental->customer->name ?? 'Unknown',
                        'amount' => $rental->total_amount ?? 0,
                        'tank_type' => $tankType
                    ]);
                }
                
                $sales = \App\Models\Sale::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->with('user')
                    ->get();
                    
                foreach ($sales as $sale) {
                    $tankType = 'N/A';
                    if (isset($sale->items[0]['tank_type'])) {
                        $tankType = $sale->items[0]['tank_type'];
                    }
                    
                    $tableData->push([
                        'period' => $weekLabel,
                        'full_date' => $sale->created_at->format('M d, Y'),
                        'type' => 'sale',
                        'customer_name' => $sale->customer_name,
                        'amount' => $sale->total_amount,
                        'tank_type' => $tankType
                    ]);
                }
                
                $refills = \App\Models\RentalRequest::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->with('customer')
                    ->get();
                    
                foreach ($refills as $refill) {
                    $tableData->push([
                        'period' => $weekLabel,
                        'type' => 'refill',
                        'customer_name' => $refill->customer->name ?? 'Unknown',
                        'amount' => 0,
                        'tank_type' => $refill->tank_type ?? 'N/A'
                    ]);
                }
            }
        } else {
            // Monthly - Last 6 months (default)
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthName = $date->format('M');
                
                $rentalCount = \App\Models\Rental::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();
                
                $salesTotal = \App\Models\Sale::whereYear('created_at', $date->year)
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
                
                // Get detailed data for tables
                $rentals = \App\Models\Rental::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->with(['customer', 'tank', 'rentalRequest'])
                    ->get();
                    
                foreach ($rentals as $rental) {
                    $tankType = 'N/A';
                    if ($rental->tank && $rental->tank->tank_type) {
                        $tankType = $rental->tank->tank_type;
                    } elseif ($rental->rentalRequest && $rental->rentalRequest->tank_type) {
                        $tankType = $rental->rentalRequest->tank_type;
                    }
                    
                    $tableData->push([
                        'period' => $monthName,
                        'full_date' => $rental->created_at->format('M d, Y'),
                        'type' => 'rental',
                        'customer_name' => $rental->customer->name ?? 'Unknown',
                        'amount' => $rental->total_amount ?? 0,
                        'tank_type' => $tankType
                    ]);
                }
                
                $sales = \App\Models\Sale::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->with('user')
                    ->get();
                    
                foreach ($sales as $sale) {
                    $tankType = 'N/A';
                    if (isset($sale->items[0]['tank_type'])) {
                        $tankType = $sale->items[0]['tank_type'];
                    }
                    
                    $tableData->push([
                        'period' => $monthName,
                        'full_date' => $sale->created_at->format('M d, Y'),
                        'type' => 'sale',
                        'customer_name' => $sale->customer_name,
                        'amount' => $sale->total_amount,
                        'tank_type' => $tankType
                    ]);
                }
                
                $refills = \App\Models\RentalRequest::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->with('customer')
                    ->get();
                    
                foreach ($refills as $refill) {
                    $tableData->push([
                        'period' => $monthName,
                        'full_date' => $refill->created_at->format('M d, Y'),
                        'type' => 'refill',
                        'customer_name' => $refill->customer->name ?? 'Unknown',
                        'amount' => 0,
                        'tank_type' => $refill->tank_type ?? 'N/A'
                    ]);
                }
            }
        }
        
        // Calculate totals based on period
        if ($period === 'daily') {
            $totalRentals = \App\Models\Rental::whereDate('created_at', '>=', now()->subDays(7))->count();
            $totalSales = \App\Models\Sale::whereDate('created_at', '>=', now()->subDays(7))->sum('total_amount') ?? 0;
            $currentPeriodRentals = \App\Models\Rental::whereDate('created_at', today())->count();
            $currentPeriodSales = \App\Models\Sale::whereDate('created_at', today())->sum('total_amount') ?? 0;
        } elseif ($period === 'weekly') {
            $totalRentals = \App\Models\Rental::whereBetween('created_at', [now()->subWeeks(4)->startOfWeek(), now()])->count();
            $totalSales = \App\Models\Sale::whereBetween('created_at', [now()->subWeeks(4)->startOfWeek(), now()])->sum('total_amount') ?? 0;
            $currentPeriodRentals = \App\Models\Rental::whereBetween('created_at', [now()->startOfWeek(), now()])->count();
            $currentPeriodSales = \App\Models\Sale::whereBetween('created_at', [now()->startOfWeek(), now()])->sum('total_amount') ?? 0;
        } else {
            $totalRentals = \App\Models\Rental::count();
            $totalSales = \App\Models\Sale::sum('total_amount') ?? 0;
            $currentPeriodRentals = \App\Models\Rental::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count();
            $currentPeriodSales = \App\Models\Sale::whereYear('created_at', now()->year)
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
        
        // Calculate comparison data
        $comparisonData = null;
        $comparisonChartData = null;
        
        if ($compareMode === 'today') {
            // Today vs Yesterday
            $todayRentals = \App\Models\Rental::whereDate('created_at', now()->toDateString())->count();
            $todaySales = \App\Models\Rental::whereDate('created_at', now()->toDateString())->sum('total_amount') ?? 0;
            $todayRefills = \App\Models\RentalRequest::whereDate('created_at', now()->toDateString())->count();
            
            $yesterdayRentals = \App\Models\Rental::whereDate('created_at', now()->subDay()->toDateString())->count();
            $yesterdaySales = \App\Models\Rental::whereDate('created_at', now()->subDay()->toDateString())->sum('total_amount') ?? 0;
            $yesterdayRefills = \App\Models\RentalRequest::whereDate('created_at', now()->subDay()->toDateString())->count();
            
            $comparisonData = [
                'today' => [
                    'rentals' => $todayRentals,
                    'sales' => (float) $todaySales,
                    'refills' => $todayRefills
                ],
                'yesterday' => [
                    'rentals' => $yesterdayRentals,
                    'sales' => (float) $yesterdaySales,
                    'refills' => $yesterdayRefills
                ],
                'percentChanges' => [
                    'rentals' => $yesterdayRentals > 0 ? (($todayRentals - $yesterdayRentals) / $yesterdayRentals) * 100 : 0,
                    'sales' => $yesterdaySales > 0 ? (($todaySales - $yesterdaySales) / $yesterdaySales) * 100 : 0,
                    'refills' => $yesterdayRefills > 0 ? (($todayRefills - $yesterdayRefills) / $yesterdayRefills) * 100 : 0
                ]
            ];
            
            // Add comparison data to chart
            $comparisonChartData = [
                ['label' => 'Today', 'rentals' => $todayRentals, 'sales' => (float) $todaySales, 'refills' => $todayRefills],
                ['label' => 'Yesterday', 'rentals' => $yesterdayRentals, 'sales' => (float) $yesterdaySales, 'refills' => $yesterdayRefills]
            ];
        } elseif ($compareMode === 'last30') {
            // Last 30 days comparison
            $last30DaysRentals = \App\Models\Rental::whereDate('created_at', '>=', now()->subDays(30))->count();
            $last30DaysSales = \App\Models\Rental::whereDate('created_at', '>=', now()->subDays(30))->sum('total_amount') ?? 0;
            $last30DaysRefills = \App\Models\RentalRequest::whereDate('created_at', '>=', now()->subDays(30))->count();
            
            $previous30DaysRentals = \App\Models\Rental::whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])->count();
            $previous30DaysSales = \App\Models\Rental::whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])->sum('total_amount') ?? 0;
            $previous30DaysRefills = \App\Models\RentalRequest::whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])->count();
            
            $comparisonData = [
                'last30Days' => [
                    'rentals' => $last30DaysRentals,
                    'sales' => (float) $last30DaysSales,
                    'refills' => $last30DaysRefills
                ],
                'previous30Days' => [
                    'rentals' => $previous30DaysRentals,
                    'sales' => (float) $previous30DaysSales,
                    'refills' => $previous30DaysRefills
                ],
                'percentChanges' => [
                    'rentals' => $previous30DaysRentals > 0 ? (($last30DaysRentals - $previous30DaysRentals) / $previous30DaysRentals) * 100 : 0,
                    'sales' => $previous30DaysSales > 0 ? (($last30DaysSales - $previous30DaysSales) / $previous30DaysSales) * 100 : 0,
                    'refills' => $previous30DaysRefills > 0 ? (($last30DaysRefills - $previous30DaysRefills) / $previous30DaysRefills) * 100 : 0
                ]
            ];
            
            // Add comparison data to chart
            $comparisonChartData = [
                ['label' => 'Last 30 Days', 'rentals' => $last30DaysRentals, 'sales' => (float) $last30DaysSales, 'refills' => $last30DaysRefills],
                ['label' => 'Previous 30 Days', 'rentals' => $previous30DaysRentals, 'sales' => (float) $previous30DaysSales, 'refills' => $previous30DaysRefills]
            ];
        } elseif ($compareMode === 'custom' && $customStartDate && $customEndDate) {
            // Custom date range
            $startDate = \Carbon\Carbon::parse($customStartDate);
            $endDate = \Carbon\Carbon::parse($customEndDate);
            
            $customRentals = \App\Models\Rental::whereBetween('created_at', [$startDate, $endDate])->count();
            $customSales = \App\Models\Rental::whereBetween('created_at', [$startDate, $endDate])->sum('total_amount') ?? 0;
            $customRefills = \App\Models\RentalRequest::whereBetween('created_at', [$startDate, $endDate])->count();
            
            // Compare with same period length from previous period
            $daysDiff = $startDate->diffInDays($endDate) + 1;
            $prevStartDate = $startDate->copy()->subDays($daysDiff);
            $prevEndDate = $endDate->copy()->subDays($daysDiff);
            
            $prevRentals = \App\Models\Rental::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
            $prevSales = \App\Models\Rental::whereBetween('created_at', [$prevStartDate, $prevEndDate])->sum('total_amount') ?? 0;
            $prevRefills = \App\Models\RentalRequest::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
            
            $comparisonData = [
                'custom' => [
                    'rentals' => $customRentals,
                    'sales' => (float) $customSales,
                    'refills' => $customRefills,
                    'startDate' => $customStartDate,
                    'endDate' => $customEndDate
                ],
                'previous' => [
                    'rentals' => $prevRentals,
                    'sales' => (float) $prevSales,
                    'refills' => $prevRefills,
                    'startDate' => $prevStartDate->toDateString(),
                    'endDate' => $prevEndDate->toDateString()
                ],
                'percentChanges' => [
                    'rentals' => $prevRentals > 0 ? (($customRentals - $prevRentals) / $prevRentals) * 100 : 0,
                    'sales' => $prevSales > 0 ? (($customSales - $prevSales) / $prevSales) * 100 : 0,
                    'refills' => $prevRefills > 0 ? (($customRefills - $prevRefills) / $prevRefills) * 100 : 0
                ]
            ];
            
            // Add comparison data to chart
            $comparisonChartData = [
                ['label' => 'Custom Range', 'rentals' => $customRentals, 'sales' => (float) $customSales, 'refills' => $customRefills],
                ['label' => 'Previous Period', 'rentals' => $prevRentals, 'sales' => (float) $prevSales, 'refills' => $prevRefills]
            ];
        }
        
        return Inertia::render('reports/index', [
            'chartData' => $chartData,
            'tableData' => $tableData,
            'totalRentals' => $totalRentals,
            'totalSales' => (float) $totalSales,
            'currentPeriodRentals' => $currentPeriodRentals,
            'currentPeriodSales' => (float) $currentPeriodSales,
            'cylinderDistribution' => $cylinderDistribution,
            'currentPeriod' => $period,
            'comparisonData' => $comparisonData,
            'compareMode' => $compareMode,
            'comparisonChartData' => $comparisonChartData
        ]);
    })->name('reports');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
