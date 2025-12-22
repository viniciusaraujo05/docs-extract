<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Força a remoção do índice unique usando SQL direto
        DB::statement('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_filename_unique');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE documents ADD CONSTRAINT documents_user_filename_unique UNIQUE (user_id, original_filename)');
    }
};
