<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request para atualização de documento.
 * 
 * Centraliza validação seguindo Single Responsibility Principle.
 */
final class UpdateDocumentRequest extends FormRequest
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
            'name.required' => 'O nome do documento é obrigatório.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
        ];
    }
}
