<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Order extends Model
{
    use HasUuids;

    protected $table = 'inventory.orders';
    protected $guarded    = [];
    protected $keyType    = 'string';
    public $incrementing  = false;

    
    protected $fillable = [
        'order_number',
        'customer_id',
        'status',
        'total_amount'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}