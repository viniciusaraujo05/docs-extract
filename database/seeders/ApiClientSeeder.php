<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ApiClient;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApiClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            $this->command->warn('No users found. Please create a user first.');

            return;
        }

        $plainSecret = 'test_secret_123';

        $client = ApiClient::create([
            'user_id' => $user->id,
            'name' => 'Test API Client',
            'contact_email' => 'api-test@docset.com',
            'client_id' => 'test_client_'.uniqid(),
            'client_secret' => $plainSecret,
            'status' => 'active',
            'rate_limit_per_minute' => 60,
            'allowed_ips' => null,
            'metadata' => [
                'description' => 'Test client for API development',
                'environment' => 'development',
            ],
        ]);

        $this->command->info('API Client created successfully!');
        $this->command->info('Client ID: '.$client->client_id);
        $this->command->info('Client Secret: '.$plainSecret);
        $this->command->info('Public ID: '.$client->public_id);
        $this->command->warn('Save these credentials - the secret cannot be retrieved again!');
    }
}
