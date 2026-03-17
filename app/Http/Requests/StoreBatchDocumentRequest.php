<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $userId = $this->user()?->id ?? 0;

        return [
            'files' => ['required', 'array', 'min:1', 'max:20'],
            'files.*' => ['required', 'file', 'mimes:pdf,png,jpg,jpeg', 'max:10240'], // 10MB max per file
            'document_type_id' => [
                'nullable',
                'integer',
                Rule::exists('document_types', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
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
    public function withValidator(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Contracts\Validation\Validator $v) {
            $files = $this->file('files', []);
            if (! is_array($files)) {
                return;
            }

            $totalBytes = array_sum(array_map(
                fn ($f) => $f instanceof \Illuminate\Http\UploadedFile ? $f->getSize() : 0,
                $files,
            ));

            // 50 MB aggregate limit
            if ($totalBytes > 50 * 1024 * 1024) {
                $v->errors()->add('files', 'Total batch size must not exceed 50MB.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'files.required' => 'Please select at least one file to upload.',
            'files.max' => 'You can upload a maximum of 20 files at once.',
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
