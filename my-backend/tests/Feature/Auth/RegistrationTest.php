<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_new_users_can_register(): void
    {
        $cashierRole = Role::where('name', Role::CASHIER)->first();

        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role_id' => $cashierRole->id
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role_id'
                ],
                'token'
            ]);
    }
}
