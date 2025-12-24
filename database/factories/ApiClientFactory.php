<?php

namespace Database\Factories;

use App\Models\ApiClient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<ApiClient>
 */
class ApiClientFactory extends Factory
{
    protected $model = ApiClient::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plainSecret = Str::random(40);

        return [
            'user_id' => User::factory(),
            'public_id' => Str::uuid(),
            'name' => $this->faker->company().' API',
            'contact_email' => $this->faker->unique()->companyEmail(),
            'client_id' => strtoupper(Str::random(32)),
            'client_secret' => Hash::make($plainSecret),
            'status' => 'active',
            'rate_limit_per_minute' => 120,
            'allowed_ips' => null,
            'metadata' => [
                'note' => 'Factory generated client',
                'plain_secret_preview' => substr($plainSecret, 0, 6).'***',
            ],
            'last_used_at' => null,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Define the model's state with a known secret for testing.
     */
    public function withSecret(string $secret): self
    {
        return $this->state(fn () => [
            'client_secret' => Hash::make($secret),
            'metadata' => [
                'note' => 'Factory client with provided secret',
            ],
        ]);
    }
}
