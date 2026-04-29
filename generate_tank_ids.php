<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tanks = App\Models\Tank::all();
$count = 0;

foreach ($tanks as $tank) {
    // Skip if already has tank_id
    if ($tank->tank_id) {
        echo "Skipping: {$tank->tank_type} - already has ID: {$tank->tank_id}\n";
        continue;
    }
    
    $prefix = 'TANK';
    
    if (stripos($tank->tank_type, 'oxygen') !== false) {
        $prefix = 'OXY';
    } elseif (stripos($tank->tank_type, 'argon') !== false) {
        $prefix = 'ARG';
    } elseif (stripos($tank->tank_type, 'nitro') !== false) {
        $prefix = 'NIT';
    } elseif (stripos($tank->tank_type, 'acetylene') !== false) {
        $prefix = 'ACE';
    } elseif (stripos($tank->tank_type, 'flask') !== false) {
        $prefix = 'FLS';
    }
    
    $tank->tank_id = $prefix . '-' . str_pad($tank->id, 4, '0', STR_PAD_LEFT);
    $tank->save();
    $count++;
    
    echo "Generated tank_id: {$tank->tank_id} for {$tank->tank_type}\n";
}

echo "\nTotal tanks updated: {$count}\n";
