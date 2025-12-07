<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        Schema::create('inventory.orders', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('customer_id')->nullable();
            $table->string('order_number')->unique();
            $table->enum('status', ['pending', 'confirmed', 'shipped', 'cancelled'])->default('pending');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->timestampTz('ordered_at')->useCurrent();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('customer_id')
                  ->references('id')
                  ->on('inventory.customers')
                  ->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::drop('inventory.orders');
    }
};
