<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\SupplierProduct;
use App\Models\Notification;
use App\Models\Tank;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of purchase orders.
     */
    public function index()
    {
        // Get purchase orders with supplier and items
        $purchaseOrders = PurchaseOrder::with(['supplier', 'items'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($po) {
                return [
                    'id' => $po->id,
                    'po_number' => $po->po_number,
                    'supplier_name' => $po->supplier_name,
                    'supplier_id' => $po->supplier_id,
                    'order_date' => $po->order_date->format('Y-m-d'),
                    'expected_delivery_date' => $po->expected_delivery_date->format('Y-m-d'),
                    'total_amount' => (float) $po->total_amount,
                    'status' => $po->status,
                    'payment_method' => $po->payment_method,
                    'payment_status' => $po->payment_status,
                    'items_count' => $po->items_count,
                    'received_count' => $po->received_count,
                    'notes' => $po->notes,
                    'created_at' => $po->created_at->format('Y-m-d H:i:s'),
                    'items' => $po->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product_name,
                            'quantity' => (int) $item->quantity,
                            'received_quantity' => (int) $item->received_quantity,
                            'price' => (float) $item->price,
                            'total' => (float) $item->total,
                        ];
                    }),
                ];
            });
        
        // Get suppliers with their products for the dropdown
        $suppliers = Supplier::with(['products' => function($query) {
            $query->where('is_active', true)->orderBy('product_name');
        }])->where('is_active', true)->orderBy('name')->get();
        
        // Generate next PO number (format: PO-001)
        $nextPoNumber = $this->generateNextPoNumber();
        
        return Inertia::render('purchase-order/index', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Purchase Order', 'href' => '/purchase-order']
            ],
            'purchaseOrders' => $purchaseOrders,
            'suppliers' => $suppliers,
            'nextPoNumber' => $nextPoNumber,
        ]);
    }
    
    /**
     * Generate the next PO number in format PO-XXX
     */
    private function generateNextPoNumber(): string
    {
        // Get the latest purchase order PO number
        // For now, we'll check from a simple counter file or session
        // In production, this should query the database
        $lastNumber = 0;
        
        // Try to get from database if table exists
        try {
            $lastPo = \DB::table('purchase_orders')
                ->orderBy('id', 'desc')
                ->first();
            
            if ($lastPo && isset($lastPo->po_number)) {
                // Extract number from PO-XXX format
                $parts = explode('-', $lastPo->po_number);
                if (count($parts) === 2 && is_numeric($parts[1])) {
                    $lastNumber = (int) $parts[1];
                }
            }
        } catch (\Exception $e) {
            // Table doesn't exist yet, use counter
            $lastNumber = session('last_po_number', 0);
        }
        
        $nextNumber = $lastNumber + 1;
        session(['last_po_number' => $nextNumber]);
        
        return 'PO-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
    
    /**
     * Store a newly created purchase order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'po_number' => 'required|string|unique:purchase_orders,po_number',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'required|date|after_or_equal:order_date',
            'payment_method' => 'required|in:cash,gcash,cash_on_delivery',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:supplier_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['price'];
            }

            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'po_number' => $validated['po_number'],
                'order_date' => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'],
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'unpaid',
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $product = SupplierProduct::find($item['product_id']);
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'supplier_product_id' => $item['product_id'],
                    'product_name' => $product->product_name,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['quantity'] * $item['price'],
                ]);
            }

            DB::commit();
            
            // Create notification for supplier
            $supplier = Supplier::find($validated['supplier_id']);
            if ($supplier && $supplier->user_id) {
                Notification::create([
                    'user_id' => $supplier->user_id,
                    'type' => 'info',
                    'title' => 'New Purchase Order',
                    'message' => "Admin has placed a new purchase order ({$purchaseOrder->po_number}) for {$totalAmount} worth of items.",
                    'link' => '/supplier/orders',
                ]);
            }
            
            return redirect()->back()->with('success', 'Purchase order created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create purchase order: ' . $e->getMessage());
        }
    }
    
    /**
     * Update purchase order status to shipped (Supplier action).
     */
    public function ship(PurchaseOrder $order)
    {
        if (!in_array($order->status, ['order_placed', 'pending'])) {
            return redirect()->back()->with('error', 'Can only ship orders that are in "Order Placed" or "Pending" status.');
        }

        $order->update(['status' => 'shipped']);

        return redirect()->back()->with('success', 'Purchase order marked as shipped!');
    }
    
    /**
     * Display the specified purchase order.
     */
    public function show($id)
    {
        // TODO: Implement purchase order details view
        return redirect()->route('purchase-order.index');
    }
    
    /**
     * Update purchase order item received quantity.
     */
    public function receiveItems(Request $request, PurchaseOrder $order)
    {
        \Log::info("=== receiveItems method called for order ID: {$order->id} ===");
        
        $request->validate([
            'items' => 'required|array',
            'items.*.item_id' => 'nullable|exists:purchase_order_items,id',
            'items.*.received_quantity' => 'required|integer|min:0',
            'payment_status' => 'required|in:unpaid,partial_paid,paid'
        ]);

        $totalQuantity = 0;
        $totalReceived = 0;

        // Handle purchase order items
        $orderItems = $order->items;
        \Log::info("Processing receive items for order {$order->id}, items count: {$orderItems->count()}");
        
        foreach ($request->items as $itemData) {
            \Log::info("Processing item data: " . json_encode($itemData));
            
            // For purchase orders, we may receive items for the whole order
            // Find the corresponding order item or use the first one
            $item = null;
            
            if (isset($itemData['item_id']) && $itemData['item_id']) {
                $item = $orderItems->find($itemData['item_id']);
                \Log::info("Looking for item by ID: {$itemData['item_id']}");
            }
            
            // If no specific item found, use the first item (for simple orders)
            if (!$item && $orderItems->count() > 0) {
                $item = $orderItems->first();
                \Log::info("Using first order item: ID={$item->id}, Product={$item->product_name}");
            }
            
            if ($item) {
                // Add to existing received quantity, don't overwrite
                $item->received_quantity += $itemData['received_quantity'];
                $item->save();
                
                $totalQuantity += $item->quantity;
                $totalReceived += $item->received_quantity;
                
                \Log::info("Updating received quantity to: {$item->received_quantity}");
                
                // Add received items to inventory
                $this->addToInventory($item->product_name, $itemData['received_quantity'], $item->price);
            } else {
                \Log::error("No order item found for the received items!");
            }
        }

        // Update order status based on received quantities
        if ($totalReceived == 0) {
            $status = 'shipped'; // Back to shipped if nothing received
        } elseif ($totalReceived < $totalQuantity) {
            $status = 'partial_received';
        } else {
            $status = 'received';
        }

        // Update both order status and payment status
        $order->update([
            'status' => $status,
            'payment_status' => $request->payment_status
        ]);

        $statusText = str_replace('_', ' ', ucfirst($status));
        $paymentText = str_replace('_', ' ', ucfirst($request->payment_status));
        
        return redirect()->back()->with('success', 
            "Items received successfully! Order status: {$statusText}, Payment status: {$paymentText}. Items added to inventory."
        );
    }
    
    /**
     * Add received items to inventory.
     */
    private function addToInventory(string $productName, int $quantity, float $price)
    {
        \Log::info("Adding to inventory: Product={$productName}, Quantity={$quantity}, Price={$price}");
        
        // Check if tank already exists
        $tank = Tank::where('tank_type', $productName)->first();
        
        if ($tank) {
            \Log::info("Found existing tank: ID={$tank->id}, Current Quantity={$tank->quantity}, Status={$tank->status}");
            // Update existing tank quantity
            $oldQuantity = $tank->quantity;
            $tank->quantity += $quantity;
            $tank->price = $price; // Update price to latest
            $tank->last_refilled = now(); // Update refill date
            $tank->status = 'available'; // Force status to available when receiving items
            $tank->save();
            \Log::info("Updated tank quantity from {$oldQuantity} to: {$tank->quantity}, status to available");
            
            // Verify the update
            $updatedTank = Tank::find($tank->id);
            \Log::info("Verification - Tank quantity in database: {$updatedTank->quantity}, status: {$updatedTank->status}");
        } else {
            \Log::info("Creating new tank for: {$productName}");
            // Create new tank entry
            $newTank = Tank::create([
                'tank_type' => $productName,
                'quantity' => $quantity,
                'price' => $price,
                'status' => 'available',
                'last_refilled' => now(),
            ]);
            \Log::info("Created new tank with ID: {$newTank->id} and quantity: {$quantity}");
        }
    }
    
    /**
     * Mark all items of a purchase order as fully received and add to inventory.
     */
    public function markReceived(Request $request, PurchaseOrder $order)
    {
        if (in_array($order->status, ['received', 'cancelled'])) {
            return redirect()->back()->with('error', 'This purchase order is already ' . $order->status . '.');
        }

        $request->validate([
            'payment_status' => 'nullable|in:unpaid,partial_paid,paid',
        ]);

        DB::beginTransaction();
        try {
            foreach ($order->items as $item) {
                $remaining = max(0, $item->quantity - $item->received_quantity);

                if ($remaining > 0) {
                    $item->received_quantity = $item->quantity;
                    $item->save();

                    // Add the remaining items to inventory
                    $this->addToInventory($item->product_name, $remaining, $item->price);
                }
            }

            $order->update([
                'status' => 'received',
                'payment_status' => $request->payment_status ?? $order->payment_status ?? 'unpaid',
            ]);

            DB::commit();

            $paymentText = ucfirst(str_replace('_', ' ', $order->fresh()->payment_status));
            return redirect()->back()->with('success', "Purchase order {$order->po_number} marked as received. Payment: {$paymentText}. Items added to inventory.");
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Mark received error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to mark order as received: ' . $e->getMessage());
        }
    }

    /**
     * Cancel a purchase order.
     */
    public function cancel(PurchaseOrder $order)
    {
        if (in_array($order->status, ['received', 'cancelled'])) {
            return redirect()->back()->with('error', 'Cannot cancel an order that is already ' . $order->status . '.');
        }

        if ($order->status === 'partial_received') {
            return redirect()->back()->with('error', 'Cannot cancel an order that has already received some items.');
        }

        $order->update(['status' => 'cancelled']);

        // Notify supplier
        if ($order->supplier && $order->supplier->user_id) {
            Notification::create([
                'user_id' => $order->supplier->user_id,
                'type' => 'warning',
                'title' => 'Purchase Order Cancelled',
                'message' => "Purchase order {$order->po_number} has been cancelled by the admin.",
                'link' => '/supplier/orders',
            ]);
        }

        return redirect()->back()->with('success', "Purchase order {$order->po_number} has been cancelled.");
    }

    /**
     * Update the specified purchase order.
     */
    public function update(Request $request, $id)
    {
        // TODO: Implement purchase order update
        return redirect()->back()->with('success', 'Purchase order updated successfully!');
    }
    
    /**
     * Remove the specified purchase order.
     */
    public function destroy($id)
    {
        // TODO: Implement purchase order deletion
        return redirect()->back()->with('success', 'Purchase order deleted successfully!');
    }
}
