<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tank;

echo "=== Checking for tank image 1778782944_profile.jpg ===\n";

// Check tanks with this image
$tanks = Tank::where('image', 'like', '%1778782944%')->get();
echo "Tanks with 1778782944 in image: " . $tanks->count() . "\n";
foreach ($tanks as $tank) {
    echo "Tank ID: {$tank->id}, Type: {$tank->tank_type}, Image: {$tank->image}\n";
}

// Check all tanks
echo "\n=== All Tank Images ===\n";
$allTanks = Tank::all();
foreach ($allTanks as $tank) {
    echo "Tank ID: {$tank->id}, Type: {$tank->tank_type}, Image: " . ($tank->image ?? 'NULL') . "\n";
}
