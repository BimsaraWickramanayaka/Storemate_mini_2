<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        Schema::create('inventory.stocks', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('product_id')->references('id')->on('inventory.products')->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->string('batch_code')->nullable();
            $table->timestampTz('received_at')->default(DB::raw('now()'));
            $table->timestamps();

            $table->index(['product_id', 'quantity']);
        });
    }

    public function down()
    {
        Schema::drop('inventory.stocks');
    }
};
