<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
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
            'email' => 'admin@meowmart.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id
        ]);

        // Create manager user
        $managerRole = Role::where('name', Role::MANAGER)->first();
        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@meowmart.com',
            'password' => bcrypt('password'),
            'role_id' => $managerRole->id
        ]);

        // Create cashier user
        $cashierRole = Role::where('name', Role::CASHIER)->first();
        User::factory()->create([
            'name' => 'Cashier User',
            'email' => 'cashier@meowmart.com',
            'password' => bcrypt('password'),
            'role_id' => $cashierRole->id
        ]);

        // Create admin user with 'admin' role
        $adminRole2 = Role::where('name', 'admin')->first();
        User::factory()->create([
            'name' => 'Admin2 User',
            'email' => 'admin2@meowmart.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole2->id
        ]);

        // User::create([
        //     'name' => 'Admin',
        //     'email' => 'admin@example.com',
        //     'password' => Hash::make('password'), // Change as needed
        //     'role_id' => 1 // Make sure this role_id exists
        // ]);
    }
}
