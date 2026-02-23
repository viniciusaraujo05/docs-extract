<?php

namespace App\Console\Commands;

use App\Models\SuperAdminSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateBlogToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:generate-token';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a secure API token for the Blog Webhook integration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating a new Blog Webhook API Token...');

        $token = 'blg_'.Str::random(40);

        SuperAdminSetting::updateOrCreate(
            ['key' => 'blog_webhook_token'],
            ['value' => hash('sha256', $token)]
        );

        $this->info('Token generated successfully! IMPORTANT: Save this token now, as it cannot be retrieved again.');
        $this->line('');
        $this->warn($token);
        $this->line('');
        $this->info('Use this token as a Bearer Token in your external system to sync posts to this blog.');
    }
}
