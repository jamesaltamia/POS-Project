<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Mail;
use App\Mail\TransactionReceipt;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const PAYMENT_METHOD_CASH = 'cash';
    const PAYMENT_METHOD_CARD = 'card';

    protected $fillable = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'subtotal',
        'tax',
        'total',
        'payment_method',
        'payment_amount',
        'change_amount',
        'status',
        'user_id'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'payment_amount' => 'decimal:2',
        'change_amount' => 'decimal:2'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function feedback(): HasOne
    {
        return $this->hasOne(Feedback::class);
    }

    public function addItem(Product $product, float $quantity, ?float $discount = 0)
    {
        $unitPrice = $product->price;
        $subtotal = ($unitPrice * $quantity) - $discount;

        $item = $this->items()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'discount' => $discount,
            'subtotal' => $subtotal
        ]);

        $this->updateTotals();

        return $item;
    }

    public function updateTotals()
    {
        $this->subtotal = $this->items->sum('subtotal');
        $this->total = $this->subtotal + $this->tax;
        $this->save();
    }

    public function calculateTotals()
    {
        $this->subtotal = $this->items->sum('subtotal');
        $this->tax = $this->subtotal * 0.10; // 10% tax
        $this->total = $this->subtotal + $this->tax;
        $this->change_amount = max(0, $this->payment_amount - $this->total);
        $this->save();
    }

    public function complete()
    {
        if ($this->status !== 'pending') {
            throw new \Exception('Transaction is not in pending status');
        }

        foreach ($this->items as $item) {
            $item->product->inventory->adjustStock(
                -$item->quantity,
                'out',
                'sale'
            );
        }

        $this->status = self::STATUS_COMPLETED;
        $this->save();

        if ($this->customer_email) {
            Mail::to($this->customer_email)->queue(new TransactionReceipt($this));
        }
    }

    public function cancel()
    {
        if ($this->status === self::STATUS_COMPLETED) {
            foreach ($this->items as $item) {
                $item->product->inventory->adjustStock(
                    $item->quantity,
                    'in',
                    'cancellation'
                );
            }
        }

        $this->status = self::STATUS_CANCELLED;
        $this->save();
    }

    public function hasFeedback(): bool
    {
        return $this->feedback()->exists();
    }
}
