<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Sale;

echo "=== Checking Sales Database ===" . PHP_EOL;

$saleCount = Sale::count();
echo "Total sales: {$saleCount}" . PHP_EOL;

if ($saleCount > 0) {
    $sales = Sale::all();
    foreach ($sales as $sale) {
        echo "Sale #{$sale->id} - Amount: ₱{$sale->total_amount} - Customer: {$sale->customer_name} - Date: {$sale->created_at}" . PHP_EOL;
    }
} else {
    echo "No sales found in database" . PHP_EOL;
}

echo PHP_EOL . "=== Check Complete ===" . PHP_EOL;
