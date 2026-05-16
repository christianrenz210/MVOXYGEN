<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$today = now()->format('Y-m-d');
echo "Today: $today\n";

$pending = \App\Models\RentalRequest::where('status', 'pending')
    ->whereDate('created_at', $today)
    ->count();

echo "Pending requests today: $pending\n";

$recent = \App\Models\RentalRequest::where('status', 'pending')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'customer_id', 'status', 'created_at']);

echo "Recent pending requests:\n";
foreach ($recent as $req) {
    echo "ID: {$req->id}, Customer: {$req->customer_id}, Status: {$req->status}, Created: {$req->created_at}\n";
}
