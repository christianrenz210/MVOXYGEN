<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Customer;

echo "=== Checking Customer Profile Images ===\n";

$customers = Customer::where('name', '!=', 'Admin')
    ->select('id', 'name', 'profile_image')
    ->get();

foreach ($customers as $customer) {
    echo "Customer: {$customer->name}\n";
    echo "Profile Image: " . ($customer->profile_image ?? 'NULL') . "\n";
    echo "---\n";
}

echo "\n=== Checking if column exists ===\n";

// Check if profile_image column exists
$schema = \Illuminate\Support\Facades\Schema::getColumnListing('customers');
if (in_array('profile_image', $schema)) {
    echo "✅ profile_image column exists in customers table\n";
} else {
    echo "❌ profile_image column NOT found in customers table\n";
}

echo "\n=== Column list ===\n";
print_r($schema);
