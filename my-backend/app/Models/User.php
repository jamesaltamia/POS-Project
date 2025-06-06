<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasRole($roleName)
    {
        return $this->role->name === $roleName;
    }

    public function hasAnyRole($roles)
    {
        // If the user has no role assigned, return false
        if (!$this->role) {
            return false;
        }
        return in_array($this->role->name, (array) $roles);
    }

    public function isAdmin()
    {
        return $this->hasRole('administrator');
    }

    public function isManager()
    {
        return $this->hasRole('manager');
    }

    public function isCashier()
    {
        return $this->hasRole('cashier');
    }
}
