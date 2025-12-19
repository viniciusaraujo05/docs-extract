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
        Schema::create('report_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            
            // Field configurations: which fields to show, aggregations, etc.
            // Structure: { fieldName: { visible: bool, aggregation: 'sum'|'avg'|'count'|'growth'|null, chartType: string } }
            $table->jsonb('field_config')->default('{}');
            
            // Document selection: 'all', 'filtered', 'manual'
            $table->string('selection_mode')->default('all');
            
            // For filtered mode: date range
            $table->date('date_from')->nullable();
            $table->date('date_to')->nullable();
            
            // For manual mode: specific document IDs
            $table->jsonb('selected_document_ids')->nullable();
            
            // Date grouping for time-series: 'day', 'month', 'year', null
            $table->string('date_grouping')->nullable();
            
            // Which date field to use for grouping
            $table->string('date_field')->nullable();
            
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'document_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_configurations');
    }
};
