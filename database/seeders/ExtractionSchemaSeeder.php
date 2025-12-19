<?php

namespace Database\Seeders;

use App\Models\ExtractionSchema;
use Illuminate\Database\Seeder;

class ExtractionSchemaSeeder extends Seeder
{
    public function run(): void
    {
        ExtractionSchema::create([
            'name' => 'Fatura Padrão',
            'document_type' => 'invoice',
            'fields' => ExtractionSchema::getDefaultInvoiceSchema()['fields'],
            'is_default' => true,
            'is_system' => true,
        ]);

        ExtractionSchema::create([
            'name' => 'Recibo Padrão',
            'document_type' => 'receipt',
            'fields' => ExtractionSchema::getDefaultReceiptSchema()['fields'],
            'is_default' => true,
            'is_system' => true,
        ]);
    }
}
