<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request para criação de tipo de documento.
 *
 * Centraliza validação seguindo Single Responsibility Principle.
 */
final class StoreDocumentTypeRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer esta requisição.
     */
    public function authorize(): bool
    {
        return true; // Autorização é feita no controller
    }

    /**
     * Regras de validação.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'fields' => ['required', 'string'],
        ];
    }

    /**
     * Mensagens de validação customizadas.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome do tipo de documento é obrigatório.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            'fields.required' => 'Os campos são obrigatórios.',
        ];
    }

    /**
     * Obtém os campos decodificados e validados.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getValidatedFields(): array
    {
        $fields = json_decode($this->input('fields'), true);

        if (! is_array($fields)) {
            throw new \InvalidArgumentException('Formato de campos inválido.');
        }

        return $fields;
    }
}
