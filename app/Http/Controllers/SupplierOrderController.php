<?php

namespace App\Http\Controllers;

use App\Models\SupplierOrder;
use App\Models\Supplier;
use App\Models\Tank;
use App\Models\SupplierProduct;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
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
        
        // Get suppliers with their products for the order form
        $suppliers = Supplier::with(['products' => function($query) {
            $query->where('is_active', true)->orderBy('product_name');
        }])->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/supplier-orders/index', [
            'orders' => $orders,
            'suppliers' => $suppliers,
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

        // Get supplier's own orders (old system)
        $supplierOrders = SupplierOrder::where('supplier_id', $supplier->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'po_number' => null,
                    'type' => 'supplier_order',
                    'tank_type' => $order->tank_type,
                    'quantity' => $order->quantity,
                    'price' => $order->price,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get admin purchase orders for this supplier (new system)
        $purchaseOrders = PurchaseOrder::where('supplier_id', $supplier->id)
            ->with(['items', 'supplier'])
            ->get()
            ->map(function ($po) {
                return [
                    'id' => $po->id,
                    'po_number' => $po->po_number,
                    'type' => 'purchase_order',
                    'tank_type' => $po->items->pluck('product_name')->join(', '),
                    'quantity' => $po->items->sum('quantity'),
                    'price' => $po->items->avg('price'),
                    'total_amount' => $po->total_amount,
                    'status' => $po->status,
                    'payment_method' => $po->payment_method,
                    'payment_status' => $po->payment_status,
                    'received_count' => $po->items->sum('received_quantity'),
                    'notes' => $po->notes,
                    'created_at' => $po->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Merge both types of orders
        $allOrders = $supplierOrders->concat($purchaseOrders)
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('supplier/orders', [
            'orders' => $allOrders,
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
        if (!in_array($order->status, ['order_placed', 'pending'])) {
            return redirect()->back()->with('error', 'Can only ship orders that are in "Order Placed" or "Pending" status.');
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

    /**
     * Display supplier's products page.
     */
    public function supplierProducts(): Response
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier) {
            abort(403, 'No supplier profile found');
        }

        // Get products associated with this supplier
        $products = SupplierProduct::where('supplier_id', $supplier->id)
            ->orderBy('product_name')
            ->get();

        return Inertia::render('supplier/products', [
            'products' => $products,
            'supplier' => $supplier,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Store a new supplier product.
     */
    public function storeProduct(Request $request)
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier) {
            abort(403, 'No supplier profile found');
        }

        $request->validate([
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
        ]);

        SupplierProduct::create([
            'supplier_id' => $supplier->id,
            'product_name' => $request->product_name,
            'description' => $request->description,
            'price' => $request->price,
            'stock_quantity' => $request->stock_quantity,
            'unit' => $request->unit,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Product added successfully!');
    }

    /**
     * Update a supplier product.
     */
    public function updateProduct(Request $request, SupplierProduct $product)
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier || $product->supplier_id !== $supplier->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        $product->update([
            'product_name' => $request->product_name,
            'description' => $request->description,
            'price' => $request->price,
            'stock_quantity' => $request->stock_quantity,
            'unit' => $request->unit,
            'is_active' => $request->is_active ?? $product->is_active,
        ]);

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    /**
     * Delete a supplier product.
     */
    public function destroyProduct(SupplierProduct $product)
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier || $product->supplier_id !== $supplier->id) {
            abort(403, 'Unauthorized');
        }

        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully!');
    }

    /**
     * Display supplier settings page.
     */
    public function settings(): Response
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier) {
            abort(403, 'No supplier profile found');
        }

        return Inertia::render('supplier/settings', [
            'supplier' => $supplier,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Update supplier profile.
     */
    public function updateProfile(Request $request)
    {
        $supplier = Supplier::where('user_id', auth()->id())->first();
        
        if (!$supplier) {
            abort(403, 'No supplier profile found');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'plant_name' => 'nullable|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'address' => 'required|string',
        ]);

        $supplier->update([
            'name' => $request->name,
            'plant_name' => $request->plant_name,
            'contact_person' => $request->contact_person,
            'contact_number' => $request->contact_number,
            'address' => $request->address,
        ]);

        // Also update the associated user's name
        if ($supplier->user) {
            $supplier->user->update([
                'name' => $request->name,
            ]);
        }

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }
}
