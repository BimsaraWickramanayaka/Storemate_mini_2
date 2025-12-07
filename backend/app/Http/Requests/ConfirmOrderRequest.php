<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // No additional fields needed to confirm an order
            // The order ID comes from the route parameter
        ];
    }
}
