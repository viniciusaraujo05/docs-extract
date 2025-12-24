<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('api_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->uuid('public_id')->unique();
            $table->string('name');
            $table->string('contact_email')->nullable();
            $table->string('client_id')->unique();
            $table->string('client_secret');
            $table->enum('status', ['active', 'paused', 'revoked'])->default('active');
            $table->unsignedInteger('rate_limit_per_minute')->default(60);
            $table->json('allowed_ips')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index(['status', 'rate_limit_per_minute']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_clients');
    }
};
