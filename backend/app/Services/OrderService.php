<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Stock;
use App\Exceptions\OutOfStockException;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Create a pending order without deducting stock
     * Stock is only deducted when order is confirmed
     */
    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {

            // Validate all products exist before processing order
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    throw new \Exception("Product with ID {$item['product_id']} not found");
                }
            }

            // Create or find customer
            $customer = Customer::firstOrCreate(
                ['email' => $data['customer']['email'] ?? null],
                [
                    'name'  => $data['customer']['name'] ?? 'Customer',
                    'phone' => $data['customer']['phone'] ?? null,
                ]
            );

            // Create the order in PENDING status
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'customer_id'  => $customer->id,
                'status'       => 'pending',
                'total_amount' => 0,
            ]);

            $totalAmount = 0;

            // Create order items WITHOUT deducting stock
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);

                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $item['product_id'],
                    'quantity'           => $item['quantity'],
                    'price_at_purchase'  => $product->price,
                ]);

                $totalAmount += $item['quantity'] * $product->price;
            }

            // Update total amount
            $order->update(['total_amount' => $totalAmount]);

            return $order->load(['customer', 'items.product']);
        });
    }

    /**
     * Confirm a pending order and deduct stock
     * This transitions the order from PENDING to CONFIRMED
     */
    public function confirmOrder(Order $order)
    {
        // Verify order is in pending status
        if ($order->status !== 'pending') {
            throw new \Exception("Only pending orders can be confirmed. Current status: {$order->status}");
        }

        return DB::transaction(function () use ($order) {

            $totalAmount = 0;

            // Process each order item with FIFO + row locking
            foreach ($order->items as $item) {
                $needed = $item->quantity;

                $stocks = Stock::where('product_id', $item->product_id)
                    ->orderBy('received_at')  // FIFO
                    ->lockForUpdate()
                    ->get();

                foreach ($stocks as $stock) {
                    if ($needed <= 0) break;

                    $take = min($stock->quantity, $needed);
                    if ($take > 0) {
                        $stock->decrement('quantity', $take);
                        $needed -= $take;
                    }
                }

                if ($needed > 0) {
                    throw new OutOfStockException("Product {$item->product_id} does not have sufficient stock");
                }

                $totalAmount += $item->quantity * $item->price_at_purchase;
            }

            // Update order status to confirmed
            $order->update([
                'status'       => 'confirmed',
                'total_amount' => $totalAmount,
            ]);

            return $order->load(['customer', 'items.product']);
        });
    }

    /**
     * Cancel a pending order only
     * Confirmed orders cannot be cancelled to prevent stock restoration issues
     * when stock batches have been deleted
     */
    public function cancelOrder(Order $order)
    {
        if ($order->status !== 'pending') {
            throw new \Exception("Only pending orders can be cancelled. Current status: {$order->status}. To handle confirmed/shipped orders, use a refund process instead.");
        }

        return DB::transaction(function () use ($order) {
            // Pending orders don't have deducted stock, so just update status
            $order->update(['status' => 'cancelled']);
            return $order->load(['customer', 'items.product']);
        });
    }
}