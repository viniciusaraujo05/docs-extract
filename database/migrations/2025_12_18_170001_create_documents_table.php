<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('name');
            $table->string('original_filename');
            $table->string('file_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            
            $table->enum('type', ['invoice', 'receipt', 'custom'])->default('invoice');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            
            $table->text('raw_text')->nullable();
            $table->json('extracted_data')->nullable();
            $table->json('schema_used')->nullable();
            
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->text('error_message')->nullable();
            $table->integer('credits_used')->default(0);
            
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['organization_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
