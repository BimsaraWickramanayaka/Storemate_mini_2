<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user for tenant
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@tenant.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create staff user for tenant
        User::create([
            'name' => 'Staff User',
            'email' => 'staff@tenant.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);
    }
}
