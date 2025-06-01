<?php

// app/Models/Role.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    const ADMIN = 'administrator';
    const MANAGER = 'manager';
    const CASHIER = 'cashier';

    protected $fillable = ['name'];

    public static function getDefaultPermissions()
    {
        return [
            self::ADMIN => [
                'users.*',
                'products.*',
                'inventory.*',
                'transactions.*',
                'reports.*',
                'settings.*',
            ],
            self::MANAGER => [
                'products.view',
                'products.create',
                'products.edit',
                'inventory.*',
                'transactions.*',
                'reports.view',
            ],
            self::CASHIER => [
                'products.view',
                'transactions.create',
                'transactions.view',
            ],
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function hasPermission($permission)
    {
        $permissions = self::getDefaultPermissions()[$this->name] ?? [];
        return in_array($permission, $permissions) || in_array('*', $permissions);
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($role) {
            // Convert role name to lowercase to ensure consistency
            $role->name = strtolower($role->name);
        });
    }
}
