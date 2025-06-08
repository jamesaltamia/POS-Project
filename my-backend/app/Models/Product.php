<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'description',
        'price',
        'category_id',
        'barcode',
        'unit',
        'is_active',
        'stock',
        'low_stock_threshold',
        'reorder_point'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'category_id' => 'integer',
        'is_active' => 'boolean',
        'stock' => 'integer',
        'low_stock_threshold' => 'integer',
        'reorder_point' => 'integer'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function inventoryLogs()
{
    return $this->hasMany(InventoryLog::class);
}

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    // public function getCurrentStockAttribute()
    // {
    //     return $this->inventory?->quantity ?? 0;
    // }

    public function isLowStock(): bool
    {
        if (!$this->inventory) {
            return false;
        }
        return $this->inventory->quantity <= $this->inventory->low_stock_threshold;
    }

    public function needsReorder(): bool
    {
        if (!$this->inventory) {
            return false;
        }
        return $this->inventory->quantity <= $this->inventory->reorder_point;
    }
}
