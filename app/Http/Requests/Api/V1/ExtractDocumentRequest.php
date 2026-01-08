<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ExtractDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'document_type_id' => ['required', 'integer', 'exists:document_types,id'],
            'force_overwrite' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Document file is required.',
            'file.mimes' => 'Document must be PDF, JPG, JPEG, PNG, or WEBP.',
            'file.max' => 'Document size must not exceed 10MB.',
            'document_type_id.required' => 'Document type (model) is required.',
            'document_type_id.exists' => 'Invalid document type. Please create a document type first.',
        ];
    }
}
