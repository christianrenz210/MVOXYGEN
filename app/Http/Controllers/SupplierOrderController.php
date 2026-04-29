<?php

namespace App\Http\Controllers;

use App\Models\SupplierOrder;
use App\Models\Supplier;
use App\Models\Tank;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierOrderController extends Controller
{
    /**
     * Display a listing of supplier orders (Admin view).
     */
    public function index(): Response
    {
        $orders = SupplierOrder::with('supplier')->orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/supplier-orders/index', [
            'orders' => $orders,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Display supplier's own orders (Supplier dashboard).
     */
    public function supplierIndex(): Response
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier) {
            abort(403, 'No supplier profile found');
        }

        $orders = SupplierOrder::where('supplier_id', $supplier->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('supplier/dashboard', [
            'orders' => $orders,
            'supplier' => $supplier,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Display supplier's orders page.
     */
    public function supplierOrders(): Response
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier) {
            abort(403, 'No supplier profile found');
        }

        $orders = SupplierOrder::where('supplier_id', $supplier->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('supplier/orders', [
            'orders' => $orders,
            'supplier' => $supplier,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Store a newly created supplier order (Admin creates order).
     */
    public function store(Request $request)
    {
        \Log::info('Supplier order request data: ' . json_encode($request->all()));
        
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'tank_type' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        \Log::info('Validation passed');

        $totalAmount = $request->quantity * $request->price;

        \Log::info('Creating supplier order...');

        SupplierOrder::create([
            'supplier_id' => $request->supplier_id,
            'tank_type' => $request->tank_type,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'total_amount' => $totalAmount,
            'status' => 'order_placed',
            'payment_status' => 'unpaid',
            'notes' => $request->notes,
        ]);

        \Log::info('Supplier order created successfully');

        return redirect()->back()->with('success', 'Order placed successfully!');
    }

    /**
     * Update order status to shipped (Supplier action).
     */
    public function ship(SupplierOrder $order)
    {
        if ($order->status !== 'order_placed') {
            return redirect()->back()->with('error', 'Can only ship orders that are in "Order Placed" status.');
        }

        $order->update(['status' => 'shipped']);

        return redirect()->back()->with('success', 'Order marked as shipped!');
    }

    /**
     * Update order status to received (Admin action - adds to inventory).
     */
    public function receive(SupplierOrder $order)
    {
        if ($order->status !== 'shipped') {
            return redirect()->back()->with('error', 'Can only receive orders that are in "Shipped" status.');
        }

        $order->update(['status' => 'received']);

        // Add to inventory
        $tank = Tank::where('tank_type', $order->tank_type)->first();
        if ($tank) {
            $tank->quantity += $order->quantity;
            $tank->save();
        } else {
            // Create new tank entry if doesn't exist
            Tank::create([
                'tank_type' => $order->tank_type,
                'quantity' => $order->quantity,
                'status' => 'available',
            ]);
        }

        return redirect()->back()->with('success', 'Order received and added to inventory!');
    }

    /**
     * Cancel order (Both admin and supplier can cancel if order_placed).
     */
    public function cancel(SupplierOrder $order)
    {
        if ($order->status !== 'order_placed') {
            return redirect()->back()->with('error', 'Can only cancel orders that are in "Order Placed" status.');
        }

        $order->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Order cancelled successfully!');
    }

    /**
     * Update payment status (Admin action).
     */
    public function updatePayment(Request $request, SupplierOrder $order)
    {
        $request->validate([
            'payment_status' => 'required|in:paid,unpaid',
        ]);

        $order->update(['payment_status' => $request->payment_status]);

        return redirect()->back()->with('success', 'Payment status updated!');
    }
}
