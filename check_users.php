<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== Checking Users ===" . PHP_EOL;

$userCount = User::count();
echo "Users count: {$userCount}" . PHP_EOL;

if ($userCount > 0) {
    $users = User::all();
    foreach ($users as $user) {
        echo "User ID: {$user->id}, Email: {$user->email}" . PHP_EOL;
    }
} else {
    echo "No users found in database" . PHP_EOL;
}

echo PHP_EOL . "=== Check Complete ===" . PHP_EOL;
