<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        Schema::create('inventory.order_items', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('order_id')->references('id')->on('inventory.orders')->onDelete('cascade');
            $table->foreignUuid('product_id')->references('id')->on('inventory.products')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('price_at_purchase', 12, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::drop('inventory.order_items');
    }
};
