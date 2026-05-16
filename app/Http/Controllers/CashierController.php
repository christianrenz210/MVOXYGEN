<?php

namespace App\Http\Controllers;

use App\Models\Tank;
use App\Models\Sale;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class CashierController extends Controller
{
    /**
     * Display the cashier POS interface.
     */
    public function index()
    {
        $tanks = Tank::where('status', 'available')->get();
        
        // Check if shift is active
        $shiftActive = session('shift_active', false);
        $shiftStartTime = session('shift_start_time');
        
        return Inertia::render('cashier/index', [
            'tanks' => $tanks,
            'shiftActive' => $shiftActive,
            'shiftStartTime' => $shiftStartTime,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }
    
    /**
     * Process a sale transaction.
     */
    public function processSale(Request $request)
    {
        \Log::info('=== processSale called ===');
        \Log::info('Request data: ' . json_encode($request->all()));
        
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'payment_method' => 'required|in:cash,gcash,card',
            'items' => 'required|array',
            'items.*.tank_id' => 'required|exists:tanks,id',
            'items.*.quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0'
        ]);
        
        \Log::info('Validation passed');
        
        try {
            DB::beginTransaction();
            
            \Log::info('Database transaction started');
            
            // Update tank quantities
            foreach ($request->items as $item) {
                \Log::info("Processing item: " . json_encode($item));
                $tank = Tank::find($item['tank_id']);
                \Log::info("Found tank: " . ($tank ? $tank->tank_type : 'null'));
                
                if ($tank && $tank->quantity >= $item['quantity']) {
                    $oldQuantity = $tank->quantity;
                    $tank->quantity -= $item['quantity'];
                    $tank->save();
                    \Log::info("Updated tank quantity from {$oldQuantity} to {$tank->quantity}");
                } else {
                    throw new \Exception("Insufficient quantity for {$tank->tank_type}");
                }
            }
            
            // Create sale record
            \Log::info('Creating sale record');
            $userId = auth()->id();
            \Log::info("User ID: {$userId}");
            
            $saleData = [
                'customer_name' => $request->customer_name,
                'payment_method' => $request->payment_method,
                'total_amount' => $request->total_amount,
                'items' => $request->items,
                'status' => 'completed',
                'user_id' => $userId,
            ];
            
            // Add GCash verification details if payment method is GCash
            if ($request->payment_method === 'gcash') {
                $saleData['gcash_reference'] = $request->gcash_reference;
                $saleData['customer_phone'] = $request->customer_phone;
                $saleData['payment_time'] = $request->payment_time;
                \Log::info('GCash verification details added');
            }
            
            $sale = Sale::create($saleData);
            
            \Log::info("Sale created with ID: {$sale->id}");
            
            DB::commit();
            
            \Log::info('Transaction committed');
            
            return redirect()->back()->with('success', "Sale #{$sale->id} processed successfully!");
            
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Sale processing error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error processing sale: ' . $e->getMessage());
        }
    }
    
    /**
     * Start shift for the cashier.
     */
    public function startShift(Request $request)
    {
        try {
            // Store shift start time in session
            $request->session()->put('shift_start_time', now()->setTimezone('Asia/Manila')->format('Y-m-d H:i:s'));
            $request->session()->put('shift_active', true);
            
            // Log shift start activity
            Activity::create([
                'user_id' => auth()->id(),
                'action' => 'shift_start',
                'description' => "Cashier " . auth()->user()->name . " started their shift",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            return redirect()->back()->with('success', 'Shift started successfully!');
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error starting shift: ' . $e->getMessage());
        }
    }

    /**
     * End shift and generate daily transaction report.
     */
    public function endShift(Request $request)
    {
        try {
            $userId = auth()->id();
            $today = now()->format('Y-m-d');
            
            // Get all sales for the current cashier today
            $sales = Sale::where('user_id', $userId)
                ->whereDate('created_at', $today)
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Calculate summary statistics
            $totalSales = $sales->count();
            $totalRevenue = $sales->sum('total_amount');
            $cashSales = $sales->where('payment_method', 'cash')->sum('total_amount');
            $gcashSales = $sales->where('payment_method', 'gcash')->sum('total_amount');
            $cardSales = $sales->where('payment_method', 'card')->sum('total_amount');
            
            // Get unique customers
            $uniqueCustomers = $sales->pluck('customer_name')->unique()->count();
            
            // Get shift start time from session
            $shiftStartTime = session('shift_start_time', now()->setTimezone('Asia/Manila')->format('Y-m-d H:i:s'));
            
            // Prepare report data
            $reportData = [
                'cashier_name' => auth()->user()->name,
                'shift_date' => $today,
                'shift_start_time' => $shiftStartTime,
                'shift_end_time' => now()->setTimezone('Asia/Manila')->format('Y-m-d H:i:s'),
                'total_sales' => $totalSales,
                'total_revenue' => $totalRevenue,
                'cash_sales' => $cashSales,
                'gcash_sales' => $gcashSales,
                'card_sales' => $cardSales,
                'unique_customers' => $uniqueCustomers,
                'sales' => $sales,
            ];
            
            // Clear shift state
            $request->session()->forget('shift_start_time');
            $request->session()->forget('shift_active');
            
            // Log shift end activity
            Activity::create([
                'user_id' => auth()->id(),
                'action' => 'shift_end',
                'description' => "Cashier " . auth()->user()->name . " ended their shift",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            // Return Inertia response with report data as props
            return Inertia::render('cashier/index', [
                'tanks' => \App\Models\Tank::where('status', 'available')->get(),
                'endShiftReport' => $reportData,
                'shiftActive' => false,
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error generating end shift report: ' . $e->getMessage());
        }
    }
}
