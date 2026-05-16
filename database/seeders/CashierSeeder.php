<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CashierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing cashier users (optional - remove if you want to keep existing data)
        DB::table('users')->where('role', 'cashier')->delete();

        $cashiers = [
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.cashier@mvoxygen.com',
                'phone' => '09123456789',
                'password' => Hash::make('password123'),
                'role' => 'cashier',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.cashier@mvoxygen.com',
                'phone' => '09234567890',
                'password' => Hash::make('password123'),
                'role' => 'cashier',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Carlos Reyes',
                'email' => 'carlos.cashier@mvoxygen.com',
                'phone' => '09345678901',
                'password' => Hash::make('password123'),
                'role' => 'cashier',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($cashiers);

        $this->command->info('Cashier users created successfully!');
        $this->command->info('Email accounts:');
        $this->command->info('- juan.cashier@mvoxygen.com (password: password123)');
        $this->command->info('- maria.cashier@mvoxygen.com (password: password123)');
        $this->command->info('- carlos.cashier@mvoxygen.com (password: password123)');
    }
}
