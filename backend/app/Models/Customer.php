<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Customer extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'inventory.customers';
    protected $guarded    = [];
    protected $keyType    = 'string';
    public $incrementing  = false;

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }
}