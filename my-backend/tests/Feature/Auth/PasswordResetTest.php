<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'role_id' => Role::where('name', Role::CASHIER)->first()->id
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email
        ]);

        $response->assertStatus(200);
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'role_id' => Role::where('name', Role::CASHIER)->first()->id
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email
        ]);

        Notification::assertSentTo($user, ResetPassword::class, function (object $notification) use ($user) {
            $response = $this->postJson('/api/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'newpassword',
                'password_confirmation' => 'newpassword',
            ]);

            $response->assertStatus(200);

            return true;
        });
    }
}
