<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\ExtractionSchema;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['invoice', 'receipt', 'custom']);

        return [
            'user_id' => User::factory(),
            'name' => $this->faker->words(3, true),
            'original_filename' => $this->faker->word().'.pdf',
            'file_path' => 'documents/test/'.$this->faker->uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => $this->faker->numberBetween(10000, 5000000),
            'type' => $type,
            'status' => 'pending',
            'schema_used' => $this->getSchemaForType($type),
        ];
    }

    private function getSchemaForType(string $type): array
    {
        return match ($type) {
            'invoice' => ExtractionSchema::getDefaultInvoiceSchema(),
            'receipt' => ExtractionSchema::getDefaultReceiptSchema(),
            default => ['fields' => []],
        };
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
        ]);
    }

    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $extractedData = $this->generateExtractedData($attributes['type'] ?? 'invoice');

            return [
                'status' => 'completed',
                'extracted_data' => $extractedData,
                'confidence_score' => $this->faker->randomFloat(2, 70, 98),
                'processed_at' => now(),
                'credits_used' => 1,
            ];
        });
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'error_message' => 'Falha ao processar documento: '.$this->faker->sentence(),
            'processed_at' => now(),
        ]);
    }

    private function generateExtractedData(string $type): array
    {
        if ($type === 'invoice') {
            return [
                'supplier_name' => $this->faker->company(),
                'supplier_vat' => $this->faker->numerify('#########'),
                'invoice_number' => $this->faker->numerify('####/####'),
                'invoice_date' => $this->faker->date('Y-m-d'),
                'due_date' => $this->faker->date('Y-m-d'),
                'subtotal' => $this->faker->randomFloat(2, 100, 10000),
                'vat_amount' => $this->faker->randomFloat(2, 10, 2000),
                'vat_rate' => 23,
                'total' => $this->faker->randomFloat(2, 110, 12000),
                'currency' => 'EUR',
            ];
        }

        return [
            'merchant_name' => $this->faker->company(),
            'date' => $this->faker->date('Y-m-d'),
            'total' => $this->faker->randomFloat(2, 5, 500),
            'payment_method' => $this->faker->randomElement(['Dinheiro', 'Cartão', 'MB Way']),
            'vat_amount' => $this->faker->randomFloat(2, 1, 100),
        ];
    }
}
