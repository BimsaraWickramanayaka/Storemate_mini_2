<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email',
            'phone' => 'sometimes|nullable|string|max:20',
        ];
    }
}
