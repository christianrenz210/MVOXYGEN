<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

echo "=== Active Rentals ===" . PHP_EOL;
echo "Status: approved or active" . PHP_EOL;
echo PHP_EOL;

$activeRentals = App\Models\RentalRequest::whereIn('status', ['approved', 'active'])
    ->with(['customer'])
    ->get();

if ($activeRentals->isEmpty()) {
    echo "No active rentals found." . PHP_EOL;
} else {
    foreach ($activeRentals as $rental) {
        echo "ID: {$rental->id}" . PHP_EOL;
        echo "Tank Type: {$rental->tank_type}" . PHP_EOL;
        echo "Status: {$rental->status}" . PHP_EOL;
        echo "Customer: " . ($rental->customer ? $rental->customer->name : 'N/A') . PHP_EOL;
        echo "Created: {$rental->created_at}" . PHP_EOL;
        echo "---" . PHP_EOL;
    }
}

echo PHP_EOL;
echo "Total Active Rentals: " . $activeRentals->count() . PHP_EOL;
