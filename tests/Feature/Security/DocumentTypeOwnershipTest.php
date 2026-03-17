<?php

namespace Tests\Feature\Security;

use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class DocumentTypeOwnershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_document_upload_rejects_foreign_document_type_ids(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $documentType = DocumentType::factory()->create([
            'user_id' => $owner->id,
        ]);

        $response = $this->actingAs($attacker)->post('/api/documents', [
            'file' => UploadedFile::fake()->image('invoice.png'),
            'type' => 'predefined',
            'document_type_id' => $documentType->id,
            'schema' => json_encode(['fields' => []], JSON_THROW_ON_ERROR),
            'extracted_data' => json_encode(['ok' => true], JSON_THROW_ON_ERROR),
        ]);

        $response->assertSessionHasErrors(['document_type_id']);
    }

    public function test_batch_upload_rejects_foreign_document_type_ids(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $documentType = DocumentType::factory()->create([
            'user_id' => $owner->id,
        ]);

        $response = $this->actingAs($attacker)->post('/api/documents/batch', [
            'files' => [UploadedFile::fake()->image('invoice.png')],
            'document_type_id' => $documentType->id,
            'fields' => [
                [
                    'name' => 'total',
                    'label' => 'Total',
                    'type' => 'string',
                ],
            ],
        ]);

        $response->assertSessionHasErrors(['document_type_id']);
    }
}
