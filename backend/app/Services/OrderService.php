<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Exceptions\OutOfStockException;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {

            // Create or find customer
            $customer = Customer::firstOrCreate(
                ['email' => $data['customer']['email'] ?? null],
                [
                    'name'  => $data['customer']['name'] ?? 'Customer',  // Provide default name if not given
                    'phone' => $data['customer']['phone'] ?? null,
                ]
            );

            // Create the order
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'customer_id'  => $customer->id,
                'status'       => 'pending',
                'total_amount' => 0,
            ]);

            $totalAmount = 0;

            // Process each item with FIFO + row locking
            foreach ($data['items'] as $item) {
                $needed = $item['quantity'];

                $stocks = Stock::where('product_id', $item['product_id'])
                    ->orderBy('received_at')           // FIFO
                    ->lockForUpdate()
                    ->get();

                foreach ($stocks as $stock) {
                    if ($needed <= 0) break;

                    $take = min($stock->quantity, $needed);
                    if ($take > 0) {
                        $stock->decrement('quantity', $take);

                        OrderItem::create([
                            'order_id'          => $order->id,
                            'product_id'        => $item['product_id'],
                            'quantity'          => $take,
                            'price_at_purchase'=> $stock->product->price,
                        ]);

                        $totalAmount += $take * $stock->product->price;
                        $needed      -= $take;
                    }
                }

                if ($needed > 0) {
                    throw new OutOfStockException("Product {$item['product_id']} is out of stock");
                }
            }

            // Finalize order
            $order->update([
                'total_amount' => $totalAmount,
                'status'       => 'confirmed',
            ]);

            return $order->load(['customer', 'items.product']);
        });
    }
}