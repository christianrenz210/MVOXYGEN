<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Daily Sales Calculation ===" . PHP_EOL;

try {
    // Test the same query used in dashboard route
    $todaySales = \App\Models\Sale::whereDate('created_at', now()->format('Y-m-d'))->sum('total_amount');
    $todaySalesCount = \App\Models\Sale::whereDate('created_at', now()->format('Y-m-d'))->count();
    
    echo "Today's Date: " . now()->format('Y-m-d') . PHP_EOL;
    echo "Today's Sales Total: ₱" . number_format($todaySales, 2) . PHP_EOL;
    echo "Today's Sales Count: " . $todaySalesCount . PHP_EOL;
    
    // Check if there are any sales at all
    $totalSales = \App\Models\Sale::count();
    echo "Total Sales in Database: " . $totalSales . PHP_EOL;
    
    // Check recent sales
    $recentSales = \App\Models\Sale::latest()->take(5)->get(['id', 'total_amount', 'created_at', 'customer_name']);
    echo PHP_EOL . "Recent Sales:" . PHP_EOL;
    foreach ($recentSales as $sale) {
        echo "- Sale #" . $sale->id . ": ₱" . number_format($sale->total_amount, 2) . 
             " on " . $sale->created_at . " (Customer: " . $sale->customer_name . ")" . PHP_EOL;
    }
    
    // Test today's sales specifically
    $todaySalesData = \App\Models\Sale::whereDate('created_at', now()->format('Y-m-d'))->get();
    echo PHP_EOL . "Today's Sales Details:" . PHP_EOL;
    foreach ($todaySalesData as $sale) {
        echo "- Sale #" . $sale->id . ": ₱" . number_format($sale->total_amount, 2) . 
             " at " . $sale->created_at . " (Customer: " . $sale->customer_name . ")" . PHP_EOL;
    }
    
    if ($todaySalesCount === 0) {
        echo PHP_EOL . "⚠️  No sales found for today. This could be why the dashboard shows ₱0." . PHP_EOL;
        echo "Possible solutions:" . PHP_EOL;
        echo "1. Create some test sales for today" . PHP_EOL;
        echo "2. Check if sales are being created with the correct date" . PHP_EOL;
        echo "3. Verify the Sale model and database connection" . PHP_EOL;
    } else {
        echo PHP_EOL . "✅ Daily sales calculation is working correctly!" . PHP_EOL;
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}
