<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class FarewellMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'message',
        'language',
        'occasion',
        'is_active',
        'start_date',
        'end_date',
        'display_order',
        'created_by_user_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime'
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public static function getOccasions(): array
    {
        return [
            'general',
            'morning',
            'afternoon',
            'evening',
            'holiday',
            'weekend',
            'special_event'
        ];
    }

    public static function getLanguages(): array
    {
        return [
            'en' => 'English',
            'es' => 'Spanish',
            'fr' => 'French',
            'de' => 'German',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'zh' => 'Chinese',
            'ja' => 'Japanese',
            'ko' => 'Korean'
        ];
    }

    public function isValidForDate(?Carbon $date = null): bool
    {
        $date = $date ?? now();

        if (!$this->is_active) {
            return false;
        }

        if ($this->start_date && $date->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $date->gt($this->end_date)) {
            return false;
        }

        return true;
    }

    public static function getRandomActive(string $language = 'en', ?string $occasion = null): ?self
    {
        $query = self::where('is_active', true)
            ->where('language', $language)
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });

        if ($occasion) {
            $query->where('occasion', $occasion);
        }

        return $query->inRandomOrder()->first();
    }

    public static function getCurrentOccasion(): string
    {
        $hour = now()->hour;

        if ($hour >= 5 && $hour < 12) {
            return 'morning';
        } elseif ($hour >= 12 && $hour < 17) {
            return 'afternoon';
        } else {
            return 'evening';
        }
    }
}
