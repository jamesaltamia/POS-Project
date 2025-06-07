<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Ensure the column exists and is an integer, then set default
            // If the column type needs to be changed, it should be done carefully
            // For now, assuming it's already an integer or compatible type
            $table->integer('low_stock_threshold')->default(5)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert to having no default, assuming it was not nullable before
            // This might require knowing the original state (nullable or not)
            // If it was NOT NULL and had no default, this is tricky to perfectly revert without more info.
            // For simplicity, we'll just remove the default. If it needs to be NOT NULL, that's a separate change.
            $table->integer('low_stock_threshold')->default(null)->change(); // Or handle original nullability
        });
    }
};
