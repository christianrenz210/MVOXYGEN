<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test the Tank model
use App\Models\Tank;

echo "=== Testing Tank Model ===" . PHP_EOL;

// Check if Tank model works
$tankCount = Tank::count();
echo "Total tanks in database: {$tankCount}" . PHP_EOL;

// Check Argon Small specifically
$argonSmall = Tank::where('tank_type', 'Argon Small')->first();
if ($argonSmall) {
    echo "Argon Small found - Current quantity: {$argonSmall->quantity}" . PHP_EOL;
    echo "Argon Small price: {$argonSmall->price}" . PHP_EOL;
    echo "Argon Small status: {$argonSmall->status}" . PHP_EOL;
} else {
    echo "Argon Small not found in database" . PHP_EOL;
}

// Test creating a tank
echo PHP_EOL . "=== Testing Tank Creation ===" . PHP_EOL;
try {
    $newTank = Tank::create([
        'tank_type' => 'Test Tank',
        'quantity' => 10,
        'price' => 1000,
        'status' => 'available',
        'last_refilled' => now(),
    ]);
    echo "Test tank created with ID: {$newTank->id}" . PHP_EOL;
    
    // Clean up
    $newTank->delete();
    echo "Test tank deleted" . PHP_EOL;
} catch (Exception $e) {
    echo "Error creating tank: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== Test Complete ===" . PHP_EOL;
