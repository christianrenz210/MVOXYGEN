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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('payment_method'); // cash, gcash, card
            $table->decimal('total_amount', 10, 2);
            $table->json('items'); // Store items as JSON
            $table->string('status')->default('completed'); // completed, refunded
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who made the sale
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
