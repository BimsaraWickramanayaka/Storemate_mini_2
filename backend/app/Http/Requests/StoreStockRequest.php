<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'product_id' => 'required|uuid',
            'quantity'   => 'required|integer|min:1',
            'batch_code' => 'nullable|string|max:255',
        ];
    }
}
