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
        // Drop the old check constraint and add new one with updated values
        DB::statement("ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check");
        DB::statement("ALTER TABLE documents ADD CONSTRAINT documents_type_check CHECK (type::text = ANY (ARRAY['invoice'::text, 'receipt'::text, 'custom'::text, 'predefined'::text]))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check");
        DB::statement("ALTER TABLE documents ADD CONSTRAINT documents_type_check CHECK (type::text = ANY (ARRAY['invoice'::text, 'receipt'::text, 'custom'::text]))");
    }
};
