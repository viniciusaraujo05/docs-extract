<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentTypeRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'fields' => ['required', 'array', 'min:1'],
            'fields.*.name' => ['required', 'string', 'max:255'],
            'fields.*.type' => ['required', 'string', 'in:string,number,date,boolean,array,object'],
            'fields.*.description' => ['nullable', 'string', 'max:500'],
            'fields.*.required' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Document type name is required.',
            'fields.required' => 'At least one field is required.',
            'fields.min' => 'Document type must have at least one field.',
            'fields.*.name.required' => 'Field name is required.',
            'fields.*.type.required' => 'Field type is required.',
            'fields.*.type.in' => 'Field type must be: string, number, date, boolean, array, or object.',
        ];
    }
}
