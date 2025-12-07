<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Stock extends Model
{
    use HasUuids;

    protected $table = 'inventory.stocks';
    protected $guarded    = [];
    protected $keyType    = 'string';
    public $incrementing  = false;

    
    protected $fillable = [
        'product_id',
        'quantity',       
        'batch_code',     
        'received_at'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}