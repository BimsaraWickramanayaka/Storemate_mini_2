<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // Customer name is required ONLY if creating a new customer (no email or email doesn't exist)
            // For existing customers, identify by email alone
            'customer.name'              => 'sometimes|required_without:customer.email|string|max:255',
            'customer.email'             => 'nullable|email',
            'customer.phone'             => 'nullable|string|max:20',

            'items'                      => 'required|array|min:1',
            'items.*.product_id'         => 'required|uuid',
            'items.*.quantity'           => 'required|integer|min:1',
        ];
    }
}