<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\ConfirmOrderRequest;
use App\Http\Requests\CancelOrderRequest;
use App\Services\OrderService;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function store(StoreOrderRequest $request)
    {
        $order = $this->orderService->createOrder($request->validated());
        return response()->json($order, 201);
    }

    public function index()
    {
        return Order::with(['customer', 'items.product'])->paginate(20);
    }

    public function show(Order $order)
    {
        return $order->load(['customer', 'items.product']);
    }

    public function confirm(ConfirmOrderRequest $request, Order $order)
    {
        try {
            $order = $this->orderService->confirmOrder($order);
            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Cannot confirm order',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function cancel(CancelOrderRequest $request, Order $order)
    {
        try {
            $order = $this->orderService->cancelOrder($order);
            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Cannot cancel order',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function destroy(Order $order)
    {
        // Only allow deletion of pending orders
        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Can only delete pending orders. Current status: ' . $order->status
            ], 409); // 409 Conflict
        }

        // Cascade delete will remove associated order items
        $order->delete();
        return response()->noContent();
    }
}