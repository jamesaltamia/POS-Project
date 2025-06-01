<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => $this->cashier->email,
            'password' => 'password'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'name',
                    'email'
                ]
            ]);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => $this->cashier->email,
            'password' => 'wrong-password'
        ]);

        $response->assertStatus(422);
    }

    public function test_users_can_logout(): void
    {
        Sanctum::actingAs($this->cashier);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200);
    }
}
