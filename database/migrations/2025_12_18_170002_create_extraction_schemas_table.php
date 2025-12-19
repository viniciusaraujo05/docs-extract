<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('extraction_schemas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('document_type')->default('invoice');
            $table->json('fields');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_system')->default(false);

            $table->timestamps();

            $table->index(['organization_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('extraction_schemas');
    }
};
