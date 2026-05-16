<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete all refill-related activities first (to avoid foreign key constraints)
        \Illuminate\Support\Facades\DB::table('activities')
            ->where('action', 'like', '%refill%')
            ->orWhere('description', 'like', '%refill%')
            ->delete();

        // Delete all refill transactions
        \Illuminate\Support\Facades\DB::table('transactions')
            ->where('transaction_type', 'Refill')
            ->delete();

        // Delete all refill rental requests
        \Illuminate\Support\Facades\DB::table('rental_requests')
            ->where('request_type', 'refill')
            ->delete();
    }

    /**
     * Reverse the migrations.
     * Note: This cannot be reversed as data is permanently deleted
     */
    public function down(): void
    {
        // Data deletion cannot be reversed
        // This migration is for data cleanup purposes only
    }
};
