<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        User::create([
            'name' => 'Admin Cafe',
            'email' => 'admin@cafe.com',
            'password' => Hash::make('password123'),
            'phone' => '081234567890',
            'address' => 'Jl. Admin No. 1',
            'role' => 'admin',
        ]);

        // Create Customer 1
        User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => Hash::make('password123'),
            'phone' => '081234567891',
            'address' => 'Jl. Customer No. 1',
            'role' => 'customer',
        ]);

        // Create Customer 2
        User::create([
            'name' => 'Siti Nurhaliza',
            'email' => 'siti@example.com',
            'password' => Hash::make('password123'),
            'phone' => '081234567892',
            'address' => 'Jl. Customer No. 2',
            'role' => 'customer',
        ]);

        echo "✓ Users seeded successfully!\n";
    }
}
