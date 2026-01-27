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

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
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

    public function test_can_retrieve_document(): void
    {
        $document = Document::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson(route('api.v1.documents.show', $document->id));

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $document->id,
                    'name' => $document->name,
                ],
            ]);
    }

    public function test_cannot_retrieve_other_users_document(): void
    {
        $otherUser = User::factory()->create();
        $document = Document::factory()->for($otherUser)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson(route('api.v1.documents.show', $document->id));

        $response->assertStatus(404);
    }

    public function test_can_list_documents(): void
    {
        Document::factory()->count(3)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson(route('api.v1.documents.index'));

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data',
                'meta' => ['pagination'],
            ]);
    }

    public function test_can_search_document_by_name(): void
    {
        Document::factory()->for($this->user)->create(['name' => 'Specific Invoice']);
        Document::factory()->for($this->user)->create(['name' => 'Other File']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson(route('api.v1.documents.search.name', ['name' => 'Invoice']));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['name' => 'Specific Invoice']);
    }

    public function test_can_search_document_by_date_range(): void
    {
        $doc1 = Document::factory()->for($this->user)->create(['created_at' => now()->subDays(5)]);
        $doc2 = Document::factory()->for($this->user)->create(['created_at' => now()->subDays(2)]);
        Document::factory()->for($this->user)->create(['created_at' => now()->subDays(10)]); // Too old

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson(route('api.v1.documents.search.date'), [
                'start_date' => now()->subDays(6)->toDateString(),
                'end_date' => now()->toDateString(),
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_filter_documents(): void
    {
        $type = DocumentType::factory()->for($this->user)->create(['name' => 'Receipt']);
        Document::factory()->for($this->user)->for($type)->create(['name' => 'Lunch Receipt']);
        Document::factory()->for($this->user)->create(['name' => 'Unknown Doc']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson(route('api.v1.documents.filter', [
                'document_type' => 'Receipt',
                'name' => 'Lunch',
            ]));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.documents')
            ->assertJsonFragment(['name' => 'Lunch Receipt']);
    }
}
