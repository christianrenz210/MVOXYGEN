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
        Schema::create('supplier_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->string('tank_type');
            $table->integer('quantity');
            $table->decimal('price', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['order_placed', 'shipped', 'received', 'cancelled'])->default('order_placed');
            $table->enum('payment_status', ['paid', 'unpaid'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_orders');
    }
};
