<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1', 'max:100'],
            'files.*' => ['required', 'file', 'mimes:pdf,png,jpg,jpeg', 'max:10240'], // 10MB max per file
            'document_type_id' => ['nullable', 'integer', 'exists:document_types,id'],
            'new_type_name' => ['required_without:document_type_id', 'string', 'max:255'],
            'fields' => ['required', 'array'],
            'fields.*.name' => ['required', 'string'],
            'fields.*.label' => ['required', 'string'],
            'fields.*.type' => ['required', 'string', 'in:string,number,date,boolean,array'],
            'fields.*.items' => ['array'], // For array fields
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'files.required' => 'Please select at least one file to upload.',
            'files.max' => 'You can upload a maximum of 100 files at once.',
            'files.*.required' => 'One or more files are missing.',
            'files.*.file' => 'One or more uploads are not valid files.',
            'files.*.mimes' => 'Only PDF, PNG, JPG, and JPEG files are allowed.',
            'files.*.max' => 'Each file must not exceed 10MB.',
            'new_type_name.required_without' => 'Please select a document type or provide a new type name.',
            'fields.required' => 'Please define at least one field for extraction.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure fields is an array
        if ($this->has('fields') && is_string($this->fields)) {
            $this->merge([
                'fields' => json_decode($this->fields, true) ?? [],
            ]);
        }
    }
}
