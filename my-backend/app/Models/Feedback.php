<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'customer_name',
        'customer_email',
        'rating',
        'service_quality_rating',
        'product_quality_rating',
        'cleanliness_rating',
        'staff_friendliness_rating',
        'would_recommend',
        'areas_of_improvement',
        'comment',
        'is_anonymous'
    ];

    protected $casts = [
        'rating' => 'integer',
        'service_quality_rating' => 'integer',
        'product_quality_rating' => 'integer',
        'cleanliness_rating' => 'integer',
        'staff_friendliness_rating' => 'integer',
        'would_recommend' => 'boolean',
        'areas_of_improvement' => 'array',
        'is_anonymous' => 'boolean'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public static function getImprovementAreas(): array
    {
        return [
            'service_speed',
            'staff_knowledge',
            'product_variety',
            'product_quality',
            'store_cleanliness',
            'price_value',
            'store_layout',
            'payment_process'
        ];
    }

    public function getAverageRating(): float
    {
        return round(($this->rating +
            $this->service_quality_rating +
            $this->product_quality_rating +
            $this->cleanliness_rating +
            $this->staff_friendliness_rating) / 5, 1);
    }
}
