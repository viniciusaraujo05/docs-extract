<?php

namespace Tests\Feature\Api\V1;

use App\Models\ApiClient;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentTypeControllerApiTest extends TestCase
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

    public function test_can_list_document_types(): void
    {
        DocumentType::factory()->count(2)->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.document-types.index'));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'fields',
                        'created_at',
                    ],
                ],
                'message',
            ]);
    }

    public function test_can_create_document_type(): void
    {
        $payload = [
            'name' => 'New Invoice Type',
            'description' => 'A custom invoice type',
            'fields' => [
                [
                    'name' => 'invoice_number',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'total_amount',
                    'type' => 'number',
                    'required' => true,
                ],
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Invoice Type')
            ->assertJsonCount(2, 'data.fields');

        $this->assertDatabaseHas('document_types', [
            'name' => 'New Invoice Type',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_can_show_document_type(): void
    {
        $type = DocumentType::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.document-types.show', $type->id));

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $type->id)
            ->assertJsonPath('data.name', $type->name);
    }

    public function test_cannot_show_other_users_document_type(): void
    {
        $otherUser = User::factory()->create();
        $type = DocumentType::factory()->for($otherUser)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.document-types.show', $type->id));

        $response->assertStatus(404);
    }

    public function test_can_update_document_type(): void
    {
        $type = DocumentType::factory()->for($this->user)->create([
            'name' => 'Old Name',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson(route('api.v1.document-types.update', $type->id), [
                'name' => 'Updated Name',
                'description' => 'Updated Description',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('document_types', [
            'id' => $type->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_delete_document_type(): void
    {
        $type = DocumentType::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->deleteJson(route('api.v1.document-types.destroy', $type->id));

        $response->assertStatus(200)
            ->assertJson(['message' => 'Document type deleted successfully.']);

        $this->assertDatabaseMissing('document_types', ['id' => $type->id]);
    }
}
