<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request para atualização de configuração de relatório.
 *
 * Centraliza validação seguindo Single Responsibility Principle.
 */
final class UpdateReportConfigurationRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'field_config' => ['sometimes', 'required', 'array'],
            'calculated_fields' => ['nullable', 'array'],
            'selection_mode' => ['sometimes', 'required', 'in:all,filtered,manual'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'selected_document_ids' => ['nullable', 'array'],
            'selected_document_ids.*' => ['integer', 'exists:documents,id'],
            'date_grouping' => ['nullable', 'in:day,month,year'],
            'date_field' => ['nullable', 'string'],
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
            'name.required' => 'O nome da configuração é obrigatório.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            'field_config.required' => 'A configuração de campos é obrigatória.',
            'field_config.array' => 'A configuração de campos deve ser um array.',
            'selection_mode.required' => 'O modo de seleção é obrigatório.',
            'selection_mode.in' => 'O modo de seleção deve ser: all, filtered ou manual.',
            'date_to.after_or_equal' => 'A data final deve ser igual ou posterior à data inicial.',
        ];
    }
}
