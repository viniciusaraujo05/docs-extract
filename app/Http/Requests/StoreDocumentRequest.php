<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:5120'], // 5MB
            'type' => ['required', 'string', 'in:predefined,new_type'],
            'document_type_id' => ['required_if:type,predefined', 'nullable', 'integer', 'exists:document_types,id'],
            'new_type_name' => ['required_if:type,new_type', 'nullable', 'string', 'max:255'],
            'schema' => ['required', 'string'],
            'extracted_data' => ['required', 'string'],
            'force_overwrite' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Por favor, selecione um ficheiro.',
            'file.mimes' => 'O ficheiro deve ser PDF, JPG, PNG ou WebP.',
            'file.max' => 'O ficheiro não pode exceder 5MB.',
        ];
    }
}
