<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\StockController;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Stock;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenancyServiceProvider.
|
| Note: Do NOT apply middleware here. The TenancyServiceProvider will
| wrap these routes with the necessary middleware (tenancy init, etc).
|
*/

// Model binding for UUIDs
Route::model('product', Product::class);
Route::model('customer', Customer::class);
Route::model('order', Order::class);
Route::model('stock', Stock::class);

// Public Auth Routes (no Sanctum protection needed for login)
Route::post('api/v1/login', [AuthController::class, 'login']);

// Protected Routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('api/v1/me', [AuthController::class, 'me']);
    Route::post('api/v1/logout', [AuthController::class, 'logout']);
    
    // Products
    Route::get('api/v1/products', [ProductController::class, 'index']);
    Route::post('api/v1/products', [ProductController::class, 'store']);
    Route::get('api/v1/products/{product}', [ProductController::class, 'show']);
    Route::put('api/v1/products/{product}', [ProductController::class, 'update']);
    Route::delete('api/v1/products/{product}', [ProductController::class, 'destroy']);
    
    // Customers
    Route::get('api/v1/customers', [CustomerController::class, 'index']);
    Route::post('api/v1/customers', [CustomerController::class, 'store']);
    Route::get('api/v1/customers/{customer}', [CustomerController::class, 'show']);
    Route::put('api/v1/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('api/v1/customers/{customer}', [CustomerController::class, 'destroy']);
    
    // Orders
    Route::get('api/v1/orders', [OrderController::class, 'index']);
    Route::post('api/v1/orders', [OrderController::class, 'store']);
    Route::get('api/v1/orders/{order}', [OrderController::class, 'show']);
    Route::post('api/v1/orders/{order}/confirm', [OrderController::class, 'confirm']);
    Route::post('api/v1/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::delete('api/v1/orders/{order}', [OrderController::class, 'destroy']);
    
    // Stocks
    Route::get('api/v1/stocks', [StockController::class, 'index']);
    Route::post('api/v1/stocks', [StockController::class, 'store']);
    Route::get('api/v1/stocks/{stock}', [StockController::class, 'show']);
    Route::delete('api/v1/stocks/{stock}', [StockController::class, 'destroy']);
    Route::get('api/v1/products/{product}/stocks', [StockController::class, 'byProduct']);
});