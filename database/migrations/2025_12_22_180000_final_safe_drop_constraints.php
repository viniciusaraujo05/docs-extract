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
        // Get the database driver
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL: Query information_schema to find and drop constraints
            $constraints = DB::select("
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'documents' 
                AND constraint_type = 'UNIQUE'
            ");

            foreach ($constraints as $constraint) {
                $name = $constraint->constraint_name;
                // Only drop if it matches the pattern we're looking for
                if (strpos($name, 'user') !== false && strpos($name, 'filename') !== false) {
                    DB::statement("ALTER TABLE documents DROP CONSTRAINT IF EXISTS \"{$name}\"");
                }
            }
        } elseif ($driver === 'mysql') {
            // MySQL: Use SHOW KEYS to find and drop indexes
            DB::statement('ALTER TABLE documents DROP INDEX IF EXISTS documents_user_filename_unique');
            DB::statement('ALTER TABLE documents DROP INDEX IF EXISTS documents_user_id_original_filename_unique');
        }

        // Also try dropping by name directly (won't fail if doesn't exist)
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_filename_unique');
            DB::statement('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_original_filename_unique');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't recreate constraints on rollback
    }
};
