<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'low_stock_threshold',
    ];

    public function adjustStock(int $amount)
    {
        $this->quantity += $amount;
        $this->save();
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->low_stock_threshold;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
