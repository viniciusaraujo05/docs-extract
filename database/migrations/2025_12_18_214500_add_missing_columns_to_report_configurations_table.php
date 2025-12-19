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
        Schema::table('report_configurations', function (Blueprint $table) {
            if (!Schema::hasColumn('report_configurations', 'user_id')) {
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            }

            if (!Schema::hasColumn('report_configurations', 'document_type_id')) {
                $table->foreignId('document_type_id')->constrained('document_types')->cascadeOnDelete();
            }

            if (!Schema::hasColumn('report_configurations', 'name')) {
                $table->string('name');
            }

            if (!Schema::hasColumn('report_configurations', 'description')) {
                $table->text('description')->nullable();
            }

            if (!Schema::hasColumn('report_configurations', 'field_config')) {
                $table->jsonb('field_config');
            }

            if (!Schema::hasColumn('report_configurations', 'selection_mode')) {
                $table->string('selection_mode')->default('all');
            }

            if (!Schema::hasColumn('report_configurations', 'date_from')) {
                $table->date('date_from')->nullable();
            }

            if (!Schema::hasColumn('report_configurations', 'date_to')) {
                $table->date('date_to')->nullable();
            }

            if (!Schema::hasColumn('report_configurations', 'selected_document_ids')) {
                $table->jsonb('selected_document_ids')->nullable();
            }

            if (!Schema::hasColumn('report_configurations', 'date_grouping')) {
                $table->string('date_grouping')->nullable();
            }

            if (!Schema::hasColumn('report_configurations', 'date_field')) {
                $table->string('date_field')->nullable();
            }

            if (!Schema::hasColumn('report_configurations', 'is_default')) {
                $table->boolean('is_default')->default(false);
            }
        });

        Schema::table('report_configurations', function (Blueprint $table) {
            if (
                Schema::hasColumn('report_configurations', 'user_id')
                && Schema::hasColumn('report_configurations', 'document_type_id')
                && !Schema::hasIndex('report_configurations', 'report_configurations_user_id_document_type_id_index')
            ) {
                $table->index(['user_id', 'document_type_id']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_configurations', function (Blueprint $table) {
            if (Schema::hasColumn('report_configurations', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }

            if (Schema::hasColumn('report_configurations', 'document_type_id')) {
                $table->dropForeign(['document_type_id']);
                $table->dropColumn('document_type_id');
            }

            if (Schema::hasColumn('report_configurations', 'name')) {
                $table->dropColumn('name');
            }

            if (Schema::hasColumn('report_configurations', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('report_configurations', 'field_config')) {
                $table->dropColumn('field_config');
            }

            if (Schema::hasColumn('report_configurations', 'selection_mode')) {
                $table->dropColumn('selection_mode');
            }

            if (Schema::hasColumn('report_configurations', 'date_from')) {
                $table->dropColumn('date_from');
            }

            if (Schema::hasColumn('report_configurations', 'date_to')) {
                $table->dropColumn('date_to');
            }

            if (Schema::hasColumn('report_configurations', 'selected_document_ids')) {
                $table->dropColumn('selected_document_ids');
            }

            if (Schema::hasColumn('report_configurations', 'date_grouping')) {
                $table->dropColumn('date_grouping');
            }

            if (Schema::hasColumn('report_configurations', 'date_field')) {
                $table->dropColumn('date_field');
            }

            if (Schema::hasColumn('report_configurations', 'is_default')) {
                $table->dropColumn('is_default');
            }

            if (Schema::hasIndex('report_configurations', 'report_configurations_user_id_document_type_id_index')) {
                $table->dropIndex(['user_id', 'document_type_id']);
            }
        });
    }
};
