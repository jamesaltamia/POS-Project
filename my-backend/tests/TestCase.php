<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Role;
use App\Models\User;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication, RefreshDatabase;

    public $admin;
    public $manager;
    public $cashier;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => Role::ADMIN]);
        $managerRole = Role::firstOrCreate(['name' => Role::MANAGER]);
        $cashierRole = Role::firstOrCreate(['name' => Role::CASHIER]);

        // Create users with roles
        $this->admin = User::factory()->create([
            'role_id' => $adminRole->id
        ]);

        $this->manager = User::factory()->create([
            'role_id' => $managerRole->id
        ]);

        $this->cashier = User::factory()->create([
            'role_id' => $cashierRole->id
        ]);
    }
}
