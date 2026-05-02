<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Sale;

echo "=== Debugging Reports Query ===" . PHP_EOL;

$currentDate = now();
echo "Current date: {$currentDate}" . PHP_EOL;
echo "Current year: {$currentDate->year}" . PHP_EOL;
echo "Current month: {$currentDate->month}" . PHP_EOL;

// Check if there are sales this month
$salesThisMonth = Sale::whereYear('created_at', $currentDate->year)
    ->whereMonth('created_at', $currentDate->month)
    ->get();

echo "Sales this month count: " . $salesThisMonth->count() . PHP_EOL;

foreach ($salesThisMonth as $sale) {
    echo "Sale #{$sale->id} - Created: {$sale->created_at} - Amount: ₱{$sale->total_amount}" . PHP_EOL;
}

// Check total sales this month
$salesTotal = Sale::whereYear('created_at', $currentDate->year)
    ->whereMonth('created_at', $currentDate->month)
    ->sum('total_amount');

echo "Total sales this month: ₱{$salesTotal}" . PHP_EOL;

// Check all sales with their dates
echo PHP_EOL . "All sales with dates:" . PHP_EOL;
$allSales = Sale::all();
foreach ($allSales as $sale) {
    echo "Sale #{$sale->id} - Created: {$sale->created_at} - Year: {$sale->created_at->year} - Month: {$sale->created_at->month}" . PHP_EOL;
}

echo PHP_EOL . "=== Debug Complete ===" . PHP_EOL;
