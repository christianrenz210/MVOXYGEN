<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tank;

echo "=== Checking Tank Images ===" . PHP_EOL;

$tanks = Tank::where('status', 'available')->get();

foreach ($tanks as $tank) {
    echo "Tank ID: {$tank->id}" . PHP_EOL;
    echo "  Type: {$tank->tank_type}" . PHP_EOL;
    echo "  Image: " . ($tank->image ?? 'NULL') . PHP_EOL;
    echo "  Image Path: " . ($tank->image ? "/storage/{$tank->image}" : 'N/A') . PHP_EOL;
    echo "  File Exists: " . ($tank->image && file_exists(public_path("storage/{$tank->image}")) ? 'YES' : 'NO') . PHP_EOL;
    echo PHP_EOL;
}

echo "=== Check Complete ===" . PHP_EOL;
