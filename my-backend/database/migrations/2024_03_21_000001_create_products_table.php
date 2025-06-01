<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('category')->nullable();
            $table->string('barcode')->nullable()->unique();
            $table->string('unit')->default('piece'); // piece, kg, liter, etc.
            $table->boolean('is_active')->default(true);
            $table->integer('stock')->default(0);
            $table->integer('low_stock_threshold');
            $table->integer('reorder_point');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
