<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class
        ]);

        // Create admin user
        $adminRole = Role::where('name', Role::ADMIN)->first();
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id
        ]);

        // Create manager user
        $managerRole = Role::where('name', Role::MANAGER)->first();
        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role_id' => $managerRole->id
        ]);

        // Create cashier user
        $cashierRole = Role::where('name', Role::CASHIER)->first();
        User::factory()->create([
            'name' => 'Cashier User',
            'email' => 'cashier@example.com',
            'password' => bcrypt('password'),
            'role_id' => $cashierRole->id
        ]);
    }
}
