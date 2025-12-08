<?php

namespace App\Http\Controllers\API;

use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends \App\Http\Controllers\Controller
{
    /**
     * Get all tenants (PUBLIC - no authentication required)
     * 
     * GET /api/tenants
     */
    public function index()
    {
        $tenants = Tenant::all();

        return response()->json([
            'success' => true,
            'data' => $tenants->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->data['name'] ?? $tenant->id,
                    'domain' => $tenant->domains->first()?->domain,
                ];
            }),
        ], 200);
    }
}
