<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        return Customer::with('orders')->paginate(20);
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        return response()->json($customer, 201);
    }

    public function show(Customer $customer)
    {
        return $customer->load('orders');
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        // Check if customer has any orders
        if ($customer->orders()->exists()) {
            return response()->json([
                'message' => 'Cannot delete customer with existing orders'
            ], 409); // 409 Conflict
        }

        $customer->delete();
        return response()->noContent();
    }
}
