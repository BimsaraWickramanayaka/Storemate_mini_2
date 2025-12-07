<?php

namespace App\Exceptions;

use Exception;

class OutOfStockException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'error'   => 'Out of stock',
            'message' => $this->getMessage(),
        ], 422);
    }
}