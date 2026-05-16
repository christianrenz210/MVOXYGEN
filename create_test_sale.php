<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Creating Test Sale for Today ===" . PHP_EOL;

try {
    // Create a test sale for today
    $sale = new \App\Models\Sale();
    $sale->customer_name = 'Test Customer';
    $sale->payment_method = 'cash';
    $sale->total_amount = 1500.00;
    $sale->cash_amount = 1500.00;
    $sale->gcash_amount = 0.00;
    $sale->card_amount = 0.00;
    $sale->user_id = 1; // Assuming user ID 1 exists
    $sale->created_at = now();
    $sale->updated_at = now();
    $sale->save();
    
    echo "✅ Test sale created successfully!" . PHP_EOL;
    echo "Sale ID: " . $sale->id . PHP_EOL;
    echo "Amount: ₱" . number_format($sale->total_amount, 2) . PHP_EOL;
    echo "Date: " . $sale->created_at . PHP_EOL;
    
    // Create some sale items
    $sale->items()->create([
        'tank_type' => 'Oxygen Tank',
        'quantity' => 2,
        'price' => 750.00,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✅ Sale items created!" . PHP_EOL;
    
    // Verify the daily sales calculation now works
    $todaySales = \App\Models\Sale::whereDate('created_at', now()->format('Y-m-d'))->sum('total_amount');
    $todaySalesCount = \App\Models\Sale::whereDate('created_at', now()->format('Y-m-d'))->count();
    
    echo PHP_EOL . "Updated Daily Sales:" . PHP_EOL;
    echo "Total: ₱" . number_format($todaySales, 2) . PHP_EOL;
    echo "Count: " . $todaySalesCount . PHP_EOL;
    
    echo PHP_EOL . "🎉 The dashboard should now show the correct daily sales!" . PHP_EOL;
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
    echo "Stack trace: " . $e->getTraceAsString() . PHP_EOL;
}
