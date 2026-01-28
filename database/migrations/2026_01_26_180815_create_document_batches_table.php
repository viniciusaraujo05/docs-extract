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
        Schema::create('document_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('document_type_id')->nullable()->constrained()->onDelete('set null');
            $table->string('new_type_name')->nullable(); // For new document types
            $table->json('schema_used'); // Fields configuration

            // Progress tracking
            $table->integer('total_documents')->default(0);
            $table->integer('processed_documents')->default(0);
            $table->integer('successful_documents')->default(0);
            $table->integer('failed_documents')->default(0);

            // Status
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');

            // Timestamps
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_batches');
    }
};
