<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subscription_id')->nullable(); // Stripe subscription ID
            $table->string('billing_period'); // YYYY-MM format
            $table->integer('documents_count')->default(0);
            $table->integer('models_count')->default(0);
            $table->integer('api_requests_count')->default(0);
            $table->integer('reports_count')->default(0);
            $table->timestamp('period_start');
            $table->timestamp('period_end');
            $table->timestamps();
            
            $table->unique(['user_id', 'billing_period']);
            $table->index(['user_id', 'period_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_usage');
    }
};
