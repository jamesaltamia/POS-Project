<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description']; // Add other fields as necessary

    /**
     * Get the products associated with the category.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
