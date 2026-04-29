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
        Schema::table('suppliers', function (Blueprint $table) {
            $table->decimal('oxygen_tank_price', 12, 2)->nullable()->after('email');
            $table->decimal('argon_small_price', 12, 2)->nullable()->after('oxygen_tank_price');
            $table->decimal('argon_big_price', 12, 2)->nullable()->after('argon_small_price');
            $table->decimal('nitro_price', 12, 2)->nullable()->after('argon_big_price');
            $table->decimal('medical_oxygen_big_price', 12, 2)->nullable()->after('nitro_price');
            $table->decimal('medical_oxygen_medium_price', 12, 2)->nullable()->after('medical_oxygen_big_price');
            $table->decimal('flask_type_standard_price', 12, 2)->nullable()->after('medical_oxygen_medium_price');
            $table->decimal('flask_type_small_price', 12, 2)->nullable()->after('flask_type_standard_price');
            $table->decimal('industrial_oxygen_price', 12, 2)->nullable()->after('flask_type_small_price');
            $table->decimal('acetylene_price', 12, 2)->nullable()->after('industrial_oxygen_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['oxygen_tank_price', 'argon_small_price', 'argon_big_price', 'nitro_price', 'medical_oxygen_big_price', 'medical_oxygen_medium_price', 'flask_type_standard_price', 'flask_type_small_price', 'industrial_oxygen_price', 'acetylene_price']);
        });
    }
};
