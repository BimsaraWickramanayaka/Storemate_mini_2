<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Response;

Route::get('/', function () {
    return view('welcome');
});

// Global CORS handler for OPTIONS requests (preflight)
// Only match v1/* paths to avoid interfering with other routes
Route::options('{path}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->header('Access-Control-Max-Age', '86400');
})->where('path', '.*');
