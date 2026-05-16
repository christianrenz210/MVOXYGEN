<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Customer;

echo "=== Checking for profile image 1778782944_profile.jpg ===\n";

// Check users
$users = User::where('profile_image', 'like', '%1778782944%')->get();
echo "Users with 1778782944 in profile_image: " . $users->count() . "\n";
foreach ($users as $user) {
    echo "User ID: {$user->id}, Name: {$user->name}, Profile Image: {$user->profile_image}\n";
}

// Check customers
$customers = Customer::where('profile_image', 'like', '%1778782944%')->get();
echo "Customers with 1778782944 in profile_image: " . $customers->count() . "\n";
foreach ($customers as $customer) {
    echo "Customer ID: {$customer->id}, Name: {$customer->name}, Profile Image: {$customer->profile_image}\n";
}

// Check if user ID 1778782944 exists
$user = User::find(1778782944);
if ($user) {
    echo "User with ID 1778782944 found: {$user->name}\n";
    echo "Profile Image: " . ($user->profile_image ?? 'NULL') . "\n";
} else {
    echo "User with ID 1778782944 not found\n";
}

// Check if customer ID 1778782944 exists
$customer = Customer::find(1778782944);
if ($customer) {
    echo "Customer with ID 1778782944 found: {$customer->name}\n";
    echo "Profile Image: " . ($customer->profile_image ?? 'NULL') . "\n";
} else {
    echo "Customer with ID 1778782944 not found\n";
}
