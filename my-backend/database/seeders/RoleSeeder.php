<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create default roles
        Role::firstOrCreate(['name' => Role::ADMIN]);
        Role::firstOrCreate(['name' => Role::MANAGER]);
        Role::firstOrCreate(['name' => Role::CASHIER]);
        // Add 'admin' role for compatibility
        Role::firstOrCreate(['name' => 'admin']);
    }
}
