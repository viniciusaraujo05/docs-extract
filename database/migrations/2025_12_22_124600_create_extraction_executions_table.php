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
        Schema::create('extraction_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->string('model_used', 100)->index();
            $table->integer('tokens_consumed')->nullable();
            $table->integer('execution_time_ms')->nullable();
            $table->text('prompt_sent')->nullable(); // Encrypted in application
            $table->text('response_received')->nullable(); // Encrypted in application
            $table->json('fields_extracted')->nullable();
            $table->json('fields_with_low_confidence')->nullable();
            $table->integer('overall_confidence')->nullable();
            $table->string('status', 50)->default('pending'); // pending, success, failed
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['document_id', 'created_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('extraction_executions');
    }
};
