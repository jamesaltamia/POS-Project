<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([Role::ADMIN, Role::MANAGER, Role::CASHIER])
        ];
    }

    public function admin()
    {
        return $this->state(fn(array $attributes) => [
            'name' => Role::ADMIN
        ]);
    }

    public function manager()
    {
        return $this->state(fn(array $attributes) => [
            'name' => Role::MANAGER
        ]);
    }

    public function cashier()
    {
        return $this->state(fn(array $attributes) => [
            'name' => Role::CASHIER
        ]);
    }
}
