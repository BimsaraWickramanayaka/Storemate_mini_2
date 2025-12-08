<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed users for tenant databases
        $this->call(UserSeeder::class);
        
        // Seed inventory data for tenant databases
        $this->call(InventoryDemoSeeder::class);
    }
}
