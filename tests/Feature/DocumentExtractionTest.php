<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentExtractionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_single_document()
    {
        Storage::fake('r2');

        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)
            ->post(route('documents.store'), [
                'file' => $file,
                'type' => 'new_type',
                'new_type_name' => 'Invoice',
                'schema' => json_encode(['fields' => []]),
                'extracted_data' => json_encode([]),
                'locale' => 'en',
            ]);

        $response->assertRedirect();
        // Since it's Inertia, we might check session or follow redirect
        // Ideally we check if document was created
        $this->assertDatabaseHas('documents', [
            'user_id' => $user->id,
            'name' => 'invoice',
        ]);
    }

    public function test_user_can_upload_batch_documents()
    {
        Storage::fake('r2');

        $user = User::factory()->create();
        $files = [
            UploadedFile::fake()->create('invoice1.pdf', 100, 'application/pdf'),
            UploadedFile::fake()->create('invoice2.pdf', 100, 'application/pdf'),
        ];

        $response = $this->actingAs($user)
            ->post(route('documents.batch.store'), [
                'files' => $files,
                'new_type_name' => 'Invoice Batch',
                'fields' => [['name' => 'total', 'label' => 'Total', 'type' => 'number']],
                'locale' => 'en',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('document_batches', [
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseCount('documents', 2);
    }
}
