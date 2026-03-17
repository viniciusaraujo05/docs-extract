<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadDocumentRequest extends FormRequest
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
        $userId = auth('api')->user()?->user_id ?? 0;

        return [
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'type' => ['required', 'string', 'in:invoice,receipt,custom'],
            'document_type_id' => [
                'nullable',
                'integer',
                Rule::exists('document_types', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'schema' => ['nullable', 'json'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Document file is required.',
            'file.mimes' => 'Document must be PDF, JPG, JPEG, PNG, or WEBP.',
            'file.max' => 'Document size must not exceed 10MB.',
            'type.in' => 'Document type must be invoice, receipt, or custom.',
        ];
    }
}
