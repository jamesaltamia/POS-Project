<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarewellMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'active',
    ];
}
