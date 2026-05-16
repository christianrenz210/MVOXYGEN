<?php

// Check if there are pending requests today
$today = now()->format('Y-m-d');
echo "Today: $today\n";

// Check database connection
try {
    $pending = \Illuminate\Support\Facades\DB::table('rental_requests')
        ->where('status', 'pending')
        ->whereDate('created_at', $today)
        ->count();
    
    echo "Pending requests today: $pending\n";
    
    // Get recent pending requests
    $recent = \Illuminate\Support\Facades\DB::table('rental_requests')
        ->where('status', 'pending')
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get(['id', 'customer_id', 'status', 'created_at']);
    
    echo "Recent pending requests:\n";
    foreach ($recent as $req) {
        echo "ID: {$req->id}, Customer: {$req->customer_id}, Status: {$req->status}, Created: {$req->created_at}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
