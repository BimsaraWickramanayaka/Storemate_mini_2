<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('stocks')->paginate(20);
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return $product->load('stocks');
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        // Check if product has any associated order items
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'Cannot update product with existing order items'
            ], 409); // 409 Conflict
        }

        $product->update($request->validated());
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        // Check if product has any associated order items
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'Cannot delete product with existing order items'
            ], 409); // 409 Conflict
        }

        // Cascade delete will remove associated stocks
        $product->delete();
        return response()->noContent();
    }
}