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
        // Get all constraints on documents table
        $constraints = DB::select("
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'documents' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%user%filename%'
        ");

        // Drop each constraint found
        foreach ($constraints as $constraint) {
            DB::statement("ALTER TABLE documents DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
        }

        // Also try the known constraint names just in case
        DB::statement('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_filename_unique');
        DB::statement('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_original_filename_unique');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't recreate the constraint on rollback
    }
};
