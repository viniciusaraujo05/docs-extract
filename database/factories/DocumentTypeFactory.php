<?php

namespace Database\Factories;

use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentType>
 */
class DocumentTypeFactory extends Factory
{
    protected $model = DocumentType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'fields' => [
                [
                    'name' => 'field_1',
                    'type' => 'string',
                    'required' => true,
                ],
                [
                    'name' => 'field_2',
                    'type' => 'number',
                    'required' => false,
                ],
            ],
            'is_active' => true,
        ];
    }
}
