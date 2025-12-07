<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class InventoryDemoSeeder extends Seeder
{
    public function run()
    {
        // Create products with Eloquent
        $macbook = Product::create([
            'sku'   => 'MBP-2024',
            'name'  => 'MacBook Pro 16"',
            'price' => 2499.99,
        ]);

        $mouse = Product::create([
            'sku'   => 'MOUSE-MX3',
            'name'  => 'MX Master 3 Mouse',
            'price' => 99.99,
        ]);

        // Create stocks for MacBook (FIFO ordering by received_at)
        Stock::create([
            'product_id' => $macbook->id,
            'quantity'   => 10,
            'batch_code' => 'BATCH-001',
            'received_at' => now()->subDays(10),
        ]);

        Stock::create([
            'product_id' => $macbook->id,
            'quantity'   => 5,
            'batch_code' => 'BATCH-002',
            'received_at' => now(),
        ]);

        // Create stocks for Mouse
        Stock::create([
            'product_id' => $mouse->id,
            'quantity'   => 50,
            'batch_code' => 'MOUSE-A',
            'received_at' => now(),
        ]);
    }
}