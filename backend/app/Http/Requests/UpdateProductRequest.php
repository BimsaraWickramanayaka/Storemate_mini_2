<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'sku'         => ['sometimes', 'required', 'string', Rule::unique('inventory.products', 'sku')->ignore($this->product->id, 'id')],
            'name'        => 'sometimes|required|string|max:255',
            'price'       => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
        ];
    }
}
