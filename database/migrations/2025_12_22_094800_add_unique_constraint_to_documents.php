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
        // Adiciona índice único para evitar duplicatas de nome de arquivo por usuário
        Schema::table('documents', function (Blueprint $table) {
            $table->unique(['user_id', 'original_filename'], 'documents_user_filename_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropUnique('documents_user_filename_unique');
        });
    }
};
