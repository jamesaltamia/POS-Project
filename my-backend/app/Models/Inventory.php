<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Events\LowStockAlert;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'product_id',
        'quantity',
        'low_stock_threshold',
        'reorder_point',
        'location'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'low_stock_threshold' => 'decimal:2',
        'reorder_point' => 'decimal:2'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stockHistory()
    {
        return $this->hasMany(InventoryMovement::class, 'product_id', 'product_id');
    }

    public function adjustStock(float $quantity, string $type, ?string $reference = null): void
    {
        DB::transaction(function () use ($quantity, $type, $reference) {
            // Update inventory
            $this->quantity += $quantity;
            $this->save();

            // Record movement
            InventoryMovement::create([
                'product_id' => $this->product_id,
                'quantity' => $quantity,
                'type' => $type,
                'reference_type' => $reference,
                'user_id' => Auth::id() ?? 1, // Fallback to system user (ID: 1) if no user is authenticated
                'notes' => "Stock {$type} of {$quantity} units"
            ]);

            // Check stock levels after adjustment
            $this->checkLowStock();
        });
    }

    public function restock(float $quantity, ?string $notes = null): void
    {
        $this->adjustStock($quantity, 'restock', $notes);
    }

    public function checkLowStock(): void
    {
        if ($this->quantity <= $this->low_stock_threshold) {
            event(new LowStockAlert($this));
        }
    }

    public function getStockStatus(): string
    {
        if ($this->quantity <= 0) {
            return 'out_of_stock';
        } elseif ($this->quantity <= $this->low_stock_threshold) {
            return 'low_stock';
        } elseif ($this->quantity <= $this->reorder_point) {
            return 'reorder';
        } else {
            return 'in_stock';
        }
    }

    public function needsReorder(): bool
    {
        return $this->quantity <= $this->reorder_point;
    }
}
