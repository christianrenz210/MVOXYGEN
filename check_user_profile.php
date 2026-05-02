<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Customer;

echo "=== Checking User Profile Images ===\n";

$users = User::all();

foreach ($users as $user) {
    echo "User: {$user->name}\n";
    echo "Profile Image: " . ($user->profile_image ?? 'NULL') . "\n";
    echo "---\n";
}

echo "\n=== Matching Customer-User Data ===\n";

$customers = Customer::where('name', '!=', 'Admin')
    ->with('user')
    ->get();

foreach ($customers as $customer) {
    echo "Customer: {$customer->name}\n";
    echo "Has User: " . ($customer->user ? 'YES' : 'NO') . "\n";
    if ($customer->user) {
        echo "User Profile Image: " . ($customer->user->profile_image ?? 'NULL') . "\n";
    }
    echo "---\n";
}
