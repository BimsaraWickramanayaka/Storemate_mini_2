<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Product;
use App\Http\Requests\StoreStockRequest;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index()
    {
        return Stock::with('product')->paginate(20);
    }

    public function store(StoreStockRequest $request)
    {
        $stock = Stock::create($request->validated());
        return response()->json($stock->load('product'), 201);
    }

    public function show(Stock $stock)
    {
        return $stock->load('product');
    }

    public function byProduct(Product $product)
    {
        return $product->stocks()->get();
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();
        return response()->noContent();
    }
}
