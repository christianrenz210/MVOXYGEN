<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Tank;

echo "=== Backfilling Missing Inventory Items ===" . PHP_EOL;

// Find all purchase orders that are marked as received or partial_received
$receivedOrders = PurchaseOrder::whereIn('status', ['received', 'partial_received'])
    ->with('items')
    ->get();

echo "Found " . count($receivedOrders) . " received/partial received orders" . PHP_EOL . PHP_EOL;

$totalItemsAdded = 0;
$ordersProcessed = 0;

foreach ($receivedOrders as $order) {
    echo "Processing Order #{$order->po_number} (ID: {$order->id})" . PHP_EOL;
    echo "Status: {$order->status}" . PHP_EOL;
    
    foreach ($order->items as $item) {
        echo "  - Item: {$item->product_name}" . PHP_EOL;
        echo "    Ordered: {$item->quantity}" . PHP_EOL;
        echo "    Received: {$item->received_quantity}" . PHP_EOL;
        
        if ($item->received_quantity > 0) {
            // Check if tank exists
            $tank = Tank::where('tank_type', $item->product_name)->first();
            
            if ($tank) {
                $oldQuantity = $tank->quantity;
                $tank->quantity += $item->received_quantity;
                $tank->price = $item->price;
                $tank->last_refilled = $item->updated_at ?? now();
                $tank->status = 'available';
                $tank->save();
                
                echo "    ✅ Updated tank: {$oldQuantity} → {$tank->quantity}" . PHP_EOL;
                $totalItemsAdded += $item->received_quantity;
            } else {
                // Create new tank
                Tank::create([
                    'tank_type' => $item->product_name,
                    'quantity' => $item->received_quantity,
                    'price' => $item->price,
                    'status' => 'available',
                    'last_refilled' => $item->updated_at ?? now(),
                ]);
                
                echo "    ✅ Created new tank with quantity: {$item->received_quantity}" . PHP_EOL;
                $totalItemsAdded += $item->received_quantity;
            }
        } else {
            echo "    ⚠️  No received quantity to add" . PHP_EOL;
        }
    }
    
    $ordersProcessed++;
    echo PHP_EOL;
}

echo "=== Summary ===" . PHP_EOL;
echo "Orders processed: {$ordersProcessed}" . PHP_EOL;
echo "Total items added to inventory: {$totalItemsAdded}" . PHP_EOL;

// Show current inventory status
echo PHP_EOL . "=== Current Inventory Status ===" . PHP_EOL;
$tanks = Tank::orderBy('tank_type')->get();
foreach ($tanks as $tank) {
    $status = $tank->quantity > 0 ? 'Available' : 'Low Stock';
    echo "{$tank->tank_type}: {$tank->quantity} ({$status})" . PHP_EOL;
}

echo PHP_EOL . "=== Backfill Complete ===" . PHP_EOL;
