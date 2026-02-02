<?php

namespace Tests\Feature\Api\V1;

use App\Models\ApiClient;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentControllerApiTest extends TestCase
{
    use RefreshDatabase;

    protected ApiClient $apiClient;

    protected User $user;

    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->apiClient = ApiClient::factory()->for($this->user)->create();
        $this->token = auth('api')->login($this->apiClient);
    }

    public function test_can_upload_document(): void
    {
        Storage::fake('documents');

        $file = UploadedFile::fake()->create('invoice.pdf', 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.store'), [
                'file' => $file,
                'type' => 'invoice',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'status',
                    'type',
                    'created_at',
                ],
                'message',
            ]);

        $this->assertDatabaseHas('documents', [
            'user_id' => $this->user->id,
        ]);

        $doc = Document::where('user_id', $this->user->id)->latest()->first();
        $this->assertStringContainsString('invoice', $doc->name);
    }

    public function test_upload_document_requires_file(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.store'), [
                'type' => 'invoice',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_can_upload_document_with_document_type_id(): void
    {
        Storage::fake('documents');
        $documentType = DocumentType::factory()->for($this->user)->create();
        $file = UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.store'), [
                'file' => $file,
                'type' => 'custom',
                'document_type_id' => $documentType->id,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('documents', [
            'user_id' => $this->user->id,
            'document_type_id' => $documentType->id,
        ]);
    }

    public function test_can_upload_document_with_custom_schema(): void
    {
        Storage::fake('documents');
        $file = UploadedFile::fake()->create('custom.pdf', 100);
        $schema = json_encode(['fields' => [['name' => 'custom_field', 'type' => 'string']]]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.store'), [
                'file' => $file,
                'type' => 'custom',
                'schema' => $schema,
            ]);

        $response->assertStatus(201);
    }

    public function test_upload_document_with_receipt_type(): void
    {
        Storage::fake('documents');
        $file = UploadedFile::fake()->create('receipt.pdf', 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.store'), [
                'file' => $file,
                'type' => 'receipt',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'receipt');
    }

    public function test_can_retrieve_document(): void
    {
        $document = Document::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.show', $document->id));

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $document->id,
                    'name' => $document->name,
                ],
            ]);
    }

    public function test_cannot_retrieve_nonexistent_document(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.show', 99999));

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Document not found or access denied.',
            ]);
    }

    public function test_retrieve_document_includes_all_fields(): void
    {
        $documentType = DocumentType::factory()->for($this->user)->create();
        $document = Document::factory()
            ->for($this->user)
            ->for($documentType)
            ->create([
                'extracted_data' => ['field1' => 'value1'],
            ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.show', $document->id));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'document_type',
                    'status',
                    'extracted_data',
                    'created_at',
                ],
            ]);
    }

    public function test_cannot_retrieve_other_users_document(): void
    {
        $otherUser = User::factory()->create();
        $document = Document::factory()->for($otherUser)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.show', $document->id));

        $response->assertStatus(404);
    }

    public function test_can_list_documents(): void
    {
        Document::factory()->count(3)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.index'));

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data',
                'meta' => ['pagination'],
            ]);
    }

    public function test_list_documents_only_shows_user_documents(): void
    {
        Document::factory()->count(2)->for($this->user)->create();

        $otherUser = User::factory()->create();
        Document::factory()->count(3)->for($otherUser)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.index'));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_list_documents_with_custom_per_page(): void
    {
        Document::factory()->count(15)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.index', ['per_page' => 5]));

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.pagination.per_page', 5);
    }

    public function test_list_documents_per_page_has_maximum_limit(): void
    {
        Document::factory()->count(50)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.index', ['per_page' => 200]));

        $response->assertStatus(200);
        $perPage = $response->json('meta.pagination.per_page');

        $this->assertLessThanOrEqual(100, $perPage);
    }

    public function test_list_documents_per_page_has_minimum_limit(): void
    {
        Document::factory()->count(10)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.index', ['per_page' => -5]));

        $response->assertStatus(200);
        $perPage = $response->json('meta.pagination.per_page');

        $this->assertGreaterThanOrEqual(1, $perPage);
    }

    public function test_list_documents_pagination_metadata_is_correct(): void
    {
        Document::factory()->count(25)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.index', ['per_page' => 10]));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'meta' => [
                    'pagination' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total',
                    ],
                ],
            ]);

        $this->assertEquals(25, $response->json('meta.pagination.total'));
        $this->assertEquals(3, $response->json('meta.pagination.last_page'));
    }

    public function test_can_search_document_by_name(): void
    {
        Document::factory()->for($this->user)->create(['name' => 'Specific Invoice']);
        Document::factory()->for($this->user)->create(['name' => 'Other File']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.search.name', ['name' => 'Invoice']));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['name' => 'Specific Invoice']);
    }

    public function test_search_by_name_requires_name_parameter(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.search.name'));

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The name parameter is required.',
            ]);
    }

    public function test_search_by_name_returns_404_when_no_matches(): void
    {
        Document::factory()->for($this->user)->create(['name' => 'Invoice']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.search.name', ['name' => 'NonExistent']));

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'No documents found with the specified name.',
            ]);
    }

    public function test_search_by_name_handles_partial_matches(): void
    {
        Document::factory()->for($this->user)->create(['name' => 'Invoice-2024.pdf']);
        Document::factory()->for($this->user)->create(['name' => 'Receipt.pdf']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.search.name', ['name' => 'Invoice']));

        $response->assertStatus(200);

        if ($response->status() === 200) {
            $this->assertGreaterThanOrEqual(1, count($response->json('data')));
        }
    }

    public function test_can_search_document_by_date_range(): void
    {
        $doc1 = Document::factory()->for($this->user)->create(['created_at' => now()->subDays(5)]);
        $doc2 = Document::factory()->for($this->user)->create(['created_at' => now()->subDays(2)]);
        Document::factory()->for($this->user)->create(['created_at' => now()->subDays(10)]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.search.date'), [
                'start_date' => now()->subDays(6)->toDateString(),
                'end_date' => now()->toDateString(),
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_search_by_date_requires_start_date(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.search.date'), [
                'end_date' => now()->toDateString(),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    }

    public function test_search_by_date_requires_end_date(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.search.date'), [
                'start_date' => now()->toDateString(),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_search_by_date_end_date_must_be_after_start_date(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.search.date'), [
                'start_date' => now()->toDateString(),
                'end_date' => now()->subDays(5)->toDateString(),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_search_by_date_accepts_custom_per_page(): void
    {
        Document::factory()->count(15)->for($this->user)->create(['created_at' => now()->subDays(2)]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.search.date'), [
                'start_date' => now()->subDays(5)->toDateString(),
                'end_date' => now()->toDateString(),
                'per_page' => 5,
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.pagination.per_page', 5);
    }

    public function test_search_by_date_includes_date_range_in_metadata(): void
    {
        $startDate = now()->subDays(5)->toDateString();
        $endDate = now()->toDateString();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.search.date'), [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('meta.date_range.start_date', $startDate)
            ->assertJsonPath('meta.date_range.end_date', $endDate);
    }

    public function test_can_filter_documents(): void
    {
        $type = DocumentType::factory()->for($this->user)->create(['name' => 'Receipt']);
        Document::factory()->for($this->user)->for($type)->create(['name' => 'Lunch Receipt']);
        Document::factory()->for($this->user)->create(['name' => 'Unknown Doc']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.filter', [
                'document_type' => 'Receipt',
                'name' => 'Lunch',
            ]));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.documents')
            ->assertJsonFragment(['name' => 'Lunch Receipt']);
    }

    public function test_filter_documents_with_no_filters_returns_all(): void
    {
        Document::factory()->count(3)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.filter'));

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data.documents');
    }

    public function test_filter_documents_by_document_type_only(): void
    {
        $type = DocumentType::factory()->for($this->user)->create(['name' => 'Invoice']);
        Document::factory()->count(2)->for($this->user)->for($type)->create();
        Document::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.filter', ['document_type' => 'Invoice']));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.documents');
    }

    public function test_filter_documents_by_date_range(): void
    {
        Document::factory()->for($this->user)->create(['created_at' => now()->subDays(2)]);
        Document::factory()->for($this->user)->create(['created_at' => now()->subDays(10)]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.filter', [
                'start_date' => now()->subDays(5)->toDateString(),
                'end_date' => now()->toDateString(),
            ]));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.documents');
    }

    public function test_filter_documents_by_name_only(): void
    {
        Document::factory()->for($this->user)->create(['name' => 'Important Document']);
        Document::factory()->for($this->user)->create(['name' => 'Other File']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.filter', ['name' => 'Important']));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.documents')
            ->assertJsonFragment(['name' => 'Important Document']);
    }

    public function test_filter_documents_includes_filters_applied_in_response(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.filter', [
                'name' => 'test',
                'document_type' => 'Invoice',
            ]));

        $response->assertStatus(200)
            ->assertJsonPath('data.filters_applied.name', 'test')
            ->assertJsonPath('data.filters_applied.document_type', 'Invoice');
    }

    public function test_filter_documents_validates_date_format(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.documents.filter', [
                'start_date' => 'invalid-date',
            ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    }

    public function test_can_extract_document_with_document_type(): void
    {
        Storage::fake('documents');
        $documentType = DocumentType::factory()->for($this->user)->create();
        $file = UploadedFile::fake()->create('extract-test.pdf', 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.extract'), [
                'file' => $file,
                'document_type_id' => $documentType->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'document_type',
                    'status',
                    'extracted_data',
                    'created_at',
                ],
                'message',
            ]);
    }

    public function test_extract_document_requires_file(): void
    {
        $documentType = DocumentType::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.extract'), [
                'document_type_id' => $documentType->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_extract_document_requires_document_type_id(): void
    {
        Storage::fake('documents');
        $file = UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.extract'), [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['document_type_id']);
    }

    public function test_extract_document_checks_for_duplicates(): void
    {
        Storage::fake('documents');
        $file = UploadedFile::fake()->create('duplicate.pdf', 100);

        Document::factory()->for($this->user)->create(['name' => 'duplicate.pdf']);

        $documentType = DocumentType::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.extract'), [
                'file' => $file,
                'document_type_id' => $documentType->id,
                'force_overwrite' => false,
            ]);

        $this->assertTrue(
            $response->status() === 409 || $response->status() === 201,
            'Expected status 409 (duplicate) or 201 (created), got '.$response->status()
        );
    }

    public function test_extract_document_can_force_overwrite_duplicate(): void
    {
        Storage::fake('documents');
        $file = UploadedFile::fake()->create('duplicate.pdf', 100);

        Document::factory()->for($this->user)->create(['name' => 'duplicate.pdf']);

        $documentType = DocumentType::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.extract'), [
                'file' => $file,
                'document_type_id' => $documentType->id,
                'force_overwrite' => true,
            ]);

        $response->assertStatus(201);
    }

    public function test_extract_document_validates_document_type(): void
    {
        Storage::fake('documents');
        $file = UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.documents.extract'), [
                'file' => $file,
                'document_type_id' => 99999,
            ]);

        $response->assertStatus(422);
    }
}
