<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Create inventory schema if it doesn't exist
        DB::statement('CREATE SCHEMA IF NOT EXISTS inventory');

        // Create products table in inventory schema
        Schema::create('inventory.products', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::drop('inventory.products');
    }
};
