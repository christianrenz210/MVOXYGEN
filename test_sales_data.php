<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Sale;

echo "=== Testing Sales Data Structure ===" . PHP_EOL;

$sales = Sale::all();
foreach ($sales as $sale) {
    echo "Sale #{$sale->id}:" . PHP_EOL;
    echo "  Customer: {$sale->customer_name}" . PHP_EOL;
    echo "  Amount: ₱{$sale->total_amount}" . PHP_EOL;
    echo "  Items: " . json_encode($sale->items) . PHP_EOL;
    
    if (isset($sale->items[0]['tank_type'])) {
        echo "  Tank Type: {$sale->items[0]['tank_type']}" . PHP_EOL;
    } else {
        echo "  Tank Type: N/A" . PHP_EOL;
    }
    
    echo "  Created: {$sale->created_at}" . PHP_EOL;
    echo PHP_EOL;
}

echo "=== Test Complete ===" . PHP_EOL;
