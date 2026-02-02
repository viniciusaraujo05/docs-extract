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

    public function test_list_document_types_only_shows_user_types(): void
    {
        DocumentType::factory()->count(2)->for($this->user)->create();
        
        $otherUser = User::factory()->create();
        DocumentType::factory()->count(3)->for($otherUser)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.document-types.index'));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_list_document_types_returns_empty_array_when_no_types(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.document-types.index'));

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data')
            ->assertJson(['data' => []]);
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

    public function test_create_document_type_requires_name(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'description' => 'Test description',
                'fields' => [],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_document_type_requires_fields(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'description' => 'Test description',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fields']);
    }

    public function test_create_document_type_fields_must_be_array(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'description' => 'Test description',
                'fields' => 'not-an-array',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fields']);
    }

    public function test_create_document_type_fields_must_have_at_least_one_field(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'description' => 'Test description',
                'fields' => [],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fields']);
    }

    public function test_create_document_type_field_requires_name(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'fields' => [
                    ['type' => 'string'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fields.0.name']);
    }

    public function test_create_document_type_field_requires_type(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'fields' => [
                    ['name' => 'test_field'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fields.0.type']);
    }

    public function test_create_document_type_field_type_must_be_valid(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'fields' => [
                    [
                        'name' => 'test_field',
                        'type' => 'invalid_type',
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fields.0.type']);
    }

    public function test_create_document_type_with_all_valid_field_types(): void
    {
        $validTypes = ['string', 'number', 'date', 'boolean', 'array', 'object'];
        
        $fields = array_map(fn($type) => [
            'name' => $type . '_field',
            'type' => $type,
            'required' => false,
        ], $validTypes);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'All Types Test',
                'description' => 'Testing all field types',
                'fields' => $fields,
            ]);

        $response->assertStatus(201)
            ->assertJsonCount(6, 'data.fields');
    }

    public function test_create_document_type_description_is_optional(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'fields' => [
                    ['name' => 'field1', 'type' => 'string'],
                ],
            ]);

        $response->assertStatus(201);
    }

    public function test_create_document_type_with_optional_field_properties(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'fields' => [
                    [
                        'name' => 'field1',
                        'type' => 'string',
                        'description' => 'Field description',
                        'required' => true,
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.fields.0.description', 'Field description')
            ->assertJsonPath('data.fields.0.required', true);
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

    public function test_cannot_show_nonexistent_document_type(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.document-types.show', 99999));

        $response->assertStatus(404)
            ->assertJson(['message' => 'Document type not found.']);
    }

    public function test_show_document_type_includes_all_fields(): void
    {
        $type = DocumentType::factory()->for($this->user)->create([
            'name' => 'Test Type',
            'description' => 'Test Description',
            'fields' => [
                ['name' => 'field1', 'type' => 'string', 'required' => true],
            ],
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson(route('api.v1.document-types.show', $type->id));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'fields',
                    'created_at',
                ],
                'message',
                'success',
            ]);
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

    public function test_cannot_update_nonexistent_document_type(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson(route('api.v1.document-types.update', 99999), [
                'name' => 'Updated Name',
            ]);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Document type not found.']);
    }

    public function test_can_update_document_type_name_only(): void
    {
        $type = DocumentType::factory()->for($this->user)->create([
            'name' => 'Old Name',
            'description' => 'Original Description',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson(route('api.v1.document-types.update', $type->id), [
                'name' => 'New Name',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.description', 'Original Description');
    }

    public function test_can_update_document_type_description_only(): void
    {
        $type = DocumentType::factory()->for($this->user)->create([
            'name' => 'Original Name',
            'description' => 'Old Description',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson(route('api.v1.document-types.update', $type->id), [
                'description' => 'New Description',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Original Name')
            ->assertJsonPath('data.description', 'New Description');
    }

    public function test_can_update_document_type_fields(): void
    {
        $type = DocumentType::factory()->for($this->user)->create([
            'fields' => [
                ['name' => 'old_field', 'type' => 'string'],
            ],
        ]);

        $newFields = [
            ['name' => 'new_field', 'type' => 'number', 'required' => true],
            ['name' => 'another_field', 'type' => 'date'],
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson(route('api.v1.document-types.update', $type->id), [
                'fields' => $newFields,
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.fields');
    }


    public function test_update_document_type_with_valid_field_types(): void
    {
        $type = DocumentType::factory()->for($this->user)->create();
        $validTypes = ['string', 'number', 'date', 'boolean', 'array', 'object'];
        
        foreach ($validTypes as $fieldType) {
            $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
                ->putJson(route('api.v1.document-types.update', $type->id), [
                    'fields' => [
                        ['name' => $fieldType . '_field', 'type' => $fieldType],
                    ],
                ]);

            $response->assertStatus(200);
        }
    }

    public function test_update_document_type_can_set_description_to_null(): void
    {
        $type = DocumentType::factory()->for($this->user)->create([
            'description' => 'Original Description',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson(route('api.v1.document-types.update', $type->id), [
                'description' => null,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.description', null);
    }

    public function test_update_document_type_includes_updated_at(): void
    {
        $type = DocumentType::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson(route('api.v1.document-types.update', $type->id), [
                'name' => 'Updated Name',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'fields',
                    'updated_at',
                ],
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

    public function test_cannot_delete_nonexistent_document_type(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->deleteJson(route('api.v1.document-types.destroy', 99999));

        $response->assertStatus(404)
            ->assertJson(['message' => 'Document type not found.']);
    }

    public function test_cannot_delete_other_users_document_type(): void
    {
        $otherUser = User::factory()->create();
        $type = DocumentType::factory()->for($otherUser)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->deleteJson(route('api.v1.document-types.destroy', $type->id));

        $response->assertStatus(404);
        
        $this->assertDatabaseHas('document_types', ['id' => $type->id]);
    }

    public function test_delete_document_type_response_structure(): void
    {
        $type = DocumentType::factory()->for($this->user)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->deleteJson(route('api.v1.document-types.destroy', $type->id));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
            ])
            ->assertJson(['success' => true]);
    }

    public function test_create_document_type_with_long_name(): void
    {
        $longName = str_repeat('a', 200);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => $longName,
                'fields' => [
                    ['name' => 'field1', 'type' => 'string'],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', $longName);
    }

    public function test_create_document_type_name_exceeds_maximum_length(): void
    {
        $tooLongName = str_repeat('a', 256);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => $tooLongName,
                'fields' => [
                    ['name' => 'field1', 'type' => 'string'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_document_type_with_maximum_description_length(): void
    {
        $longDescription = str_repeat('a', 1000);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Test Type',
                'description' => $longDescription,
                'fields' => [
                    ['name' => 'field1', 'type' => 'string'],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.description', $longDescription);
    }

    public function test_create_document_type_with_complex_fields_structure(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson(route('api.v1.document-types.store'), [
                'name' => 'Complex Type',
                'description' => 'A type with complex fields',
                'fields' => [
                    [
                        'name' => 'string_field',
                        'type' => 'string',
                        'description' => 'A string field',
                        'required' => true,
                    ],
                    [
                        'name' => 'number_field',
                        'type' => 'number',
                        'description' => 'A number field',
                        'required' => false,
                    ],
                    [
                        'name' => 'date_field',
                        'type' => 'date',
                        'required' => true,
                    ],
                    [
                        'name' => 'boolean_field',
                        'type' => 'boolean',
                    ],
                    [
                        'name' => 'array_field',
                        'type' => 'array',
                    ],
                    [
                        'name' => 'object_field',
                        'type' => 'object',
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonCount(6, 'data.fields');
    }
}
