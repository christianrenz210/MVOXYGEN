<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::create([
            'name' => 'Test Supplier',
            'email' => 'supplier@test.com',
            'password' => bcrypt('password123'),
            'role' => 'vendor',
            'is_active' => true,
        ]);

        Supplier::create([
            'user_id' => $user->id,
            'name' => 'Test Supplier Co',
            'plant_name' => 'Main Plant',
            'address' => '123 Supplier St',
            'contact_person' => 'John Doe',
            'contact_number' => '09123456789',
            'email' => 'supplier@test.com',
            'is_active' => true,
        ]);

        $this->command->info('Supplier account created successfully!');
        $this->command->info('Email: supplier@test.com');
        $this->command->info('Password: password123');
    }
}
