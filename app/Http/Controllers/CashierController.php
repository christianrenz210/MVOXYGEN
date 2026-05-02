<?php

namespace App\Http\Controllers;

use App\Models\Tank;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class CashierController extends Controller
{
    /**
     * Display the cashier POS interface.
     */
    public function index(): Response
    {
        $tanks = Tank::where('status', 'available')->get();
        
        return Inertia::render('cashier/index', [
            'tanks' => $tanks,
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
            
            $sale = Sale::create([
                'customer_name' => $request->customer_name,
                'payment_method' => $request->payment_method,
                'total_amount' => $request->total_amount,
                'items' => $request->items,
                'status' => 'completed',
                'user_id' => $userId,
            ]);
            
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
}
