<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'inventory.products';
    protected $guarded    = [];
    protected $keyType    = 'string';
    public $incrementing  = false;                     

    public function stocks()
    {
        return $this->hasMany(Stock::class, 'product_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }
}