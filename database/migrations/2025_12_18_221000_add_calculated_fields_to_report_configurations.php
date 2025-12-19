<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('report_configurations', function (Blueprint $table) {
            if (! Schema::hasColumn('report_configurations', 'calculated_fields')) {
                $table->jsonb('calculated_fields')->nullable()->after('field_config');
            }
        });
    }

    public function down(): void
    {
        Schema::table('report_configurations', function (Blueprint $table) {
            if (Schema::hasColumn('report_configurations', 'calculated_fields')) {
                $table->dropColumn('calculated_fields');
            }
        });
    }
};
