<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\TenantController;
use App\Http\Middleware\EnableCorsMiddleware;

// Public routes (no authentication required)
Route::middleware([EnableCorsMiddleware::class, 'api'])->prefix('v1')->group(function () {
    // Get all tenants (public endpoint for tenant selector)
    Route::get('tenants', [TenantController::class, 'index']);
});
