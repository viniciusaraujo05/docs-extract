<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_filename_unique');
        DB::statement('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_original_filename_unique');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->unique(['user_id', 'original_filename'], 'documents_user_filename_unique');
        });
    }
};
