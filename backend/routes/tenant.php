<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\StockController;
use App\Http\Middleware\EnableCorsMiddleware;
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
| These routes are loaded by the TenantRouteServiceProvider.
|
*/

// Model binding for UUIDs
Route::model('product', Product::class);
Route::model('customer', Customer::class);
Route::model('order', Order::class);
Route::model('stock', Stock::class);

Route::middleware([
    EnableCorsMiddleware::class, // CORS must be first
    'api',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->prefix('v1')->group(function () {
    
    // Products
    Route::get('products', [ProductController::class, 'index']);
    Route::post('products', [ProductController::class, 'store']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::put('products/{product}', [ProductController::class, 'update']);
    Route::delete('products/{product}', [ProductController::class, 'destroy']);
    
    // Customers
    Route::get('customers', [CustomerController::class, 'index']);
    Route::post('customers', [CustomerController::class, 'store']);
    Route::get('customers/{customer}', [CustomerController::class, 'show']);
    Route::put('customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy']);
    
    // Orders
    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::post('orders/{order}/confirm', [OrderController::class, 'confirm']);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::delete('orders/{order}', [OrderController::class, 'destroy']);
    
    // Stocks
    Route::get('stocks', [StockController::class, 'index']);
    Route::post('stocks', [StockController::class, 'store']);
    Route::get('stocks/{stock}', [StockController::class, 'show']);
    Route::delete('stocks/{stock}', [StockController::class, 'destroy']);
    Route::get('products/{product}/stocks', [StockController::class, 'byProduct']);
});