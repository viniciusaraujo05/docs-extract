<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'extracted_data' => ['required', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'extracted_data.required' => 'Os dados extraídos são obrigatórios.',
            'extracted_data.array' => 'Os dados extraídos devem ser um objeto válido.',
        ];
    }
}
