<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Tank;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CashierDashboardController extends Controller
{
    /**
     * Display the cashier dashboard.
     */
    public function index(): Response
    {
        $user = auth()->user();
        
        // Get today's sales for this cashier
        $todaySales = Sale::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->get();
            
        $todaySalesTotal = $todaySales->sum('total_amount');
        $todaySalesCount = $todaySales->count();
        
        // Get this week's sales for this cashier
        $weekSales = Sale::where('user_id', $user->id)
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->get();
            
        $weekSalesTotal = $weekSales->sum('total_amount');
        $weekSalesCount = $weekSales->count();
        
        // Get this month's sales for this cashier
        $monthSales = Sale::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->get();
            
        $monthSalesTotal = $monthSales->sum('total_amount');
        $monthSalesCount = $monthSales->count();
        
        // Get recent sales (last 10)
        $recentSales = Sale::where('user_id', $user->id)
            ->with('user')
            ->latest()
            ->limit(10)
            ->get();
            
        // Get available tanks for quick sale
        $availableTanks = Tank::where('status', 'available')
            ->where('quantity', '>', 0)
            ->orderBy('tank_type')
            ->get();
            
        // Get low stock tanks
        $lowStockTanks = Tank::where('quantity', '<=', 5)
            ->where('quantity', '>', 0)
            ->orderBy('quantity', 'asc')
            ->get();
            
        // Get cashier's recent activities
        $activities = Activity::where('user_id', $user->id)
            ->with(['customer', 'rentalRequest'])
            ->latest()
            ->limit(10)
            ->get();
            
        // Get sales data for chart (last 7 days)
        $salesChartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $daySales = Sale::where('user_id', $user->id)
                ->whereDate('created_at', $date->toDateString())
                ->sum('total_amount');
                
            $salesChartData[] = [
                'date' => $date->format('M d'),
                'sales' => (float) $daySales
            ];
        }
        
        return Inertia::render('cashier/dashboard', [
            'stats' => [
                'today' => [
                    'total' => $todaySalesTotal,
                    'count' => $todaySalesCount,
                ],
                'week' => [
                    'total' => $weekSalesTotal,
                    'count' => $weekSalesCount,
                ],
                'month' => [
                    'total' => $monthSalesTotal,
                    'count' => $monthSalesCount,
                ],
            ],
            'recentSales' => $recentSales,
            'availableTanks' => $availableTanks,
            'lowStockTanks' => $lowStockTanks,
            'activities' => $activities,
            'salesChartData' => $salesChartData,
            'auth' => [
                'user' => $user
            ]
        ]);
    }
    
    /**
     * Display cashier profile settings.
     */
    public function profile(): Response
    {
        return Inertia::render('cashier/profile', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }
    
    /**
     * Update cashier profile.
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);
        
        $user->update($request->only(['name', 'email', 'phone']));
        
        return redirect()->back()->with('success', 'Profile updated successfully.');
    }
    
    /**
     * Display sales history for the cashier.
     */
    public function salesHistory(): Response
    {
        $user = auth()->user();
        
        $sales = Sale::where('user_id', $user->id)
            ->with('user')
            ->latest()
            ->paginate(20);
            
        return Inertia::render('cashier/sales-history', [
            'sales' => $sales,
            'auth' => [
                'user' => $user
            ]
        ]);
    }
    
    /**
     * Display audit trail for GCash payments.
     */
    public function auditTrail(): Response
    {
        $user = auth()->user();
        
        // Get all sales for the cashier with audit details
        $sales = Sale::where('user_id', $user->id)
            ->with('user')
            ->latest()
            ->get();
            
        return Inertia::render('cashier/audit-trail', [
            'sales' => $sales,
            'auth' => [
                'user' => $user
            ]
        ]);
    }
}
