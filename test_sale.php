<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Sale;

echo "=== Testing Sale Model ===" . PHP_EOL;

try {
    $sale = new Sale();
    $sale->customer_name = 'Test Customer';
    $sale->payment_method = 'cash';
    $sale->total_amount = 100.50;
    $sale->items = [['tank_id' => 1, 'quantity' => 1]];
    $sale->status = 'completed';
    $sale->user_id = 20;
    $sale->save();
    
    echo "Test sale created with ID: {$sale->id}" . PHP_EOL;
    
    // Clean up
    $sale->delete();
    echo "Test sale deleted" . PHP_EOL;
    
} catch (Exception $e) {
    echo "Error creating test sale: " . $e->getMessage() . PHP_EOL;
    echo "Stack trace: " . $e->getTraceAsString() . PHP_EOL;
}

echo PHP_EOL . "=== Test Complete ===" . PHP_EOL;
