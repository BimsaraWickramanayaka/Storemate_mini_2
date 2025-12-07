<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
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

    
    public function index()   { return Order::with(['customer', 'items.product'])->paginate(20); }
    public function show(Order $order) { return $order->load(['customer', 'items.product']); }
}