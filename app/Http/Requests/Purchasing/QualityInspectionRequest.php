<?php

namespace App\Http\Requests\Purchasing;

use Illuminate\Foundation\Http\FormRequest;

class QualityInspectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'passed_qty' => ['required', 'integer', 'min:0'],
            'failed_qty' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'checklist_results' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom error messages for validator.
     */
    public function messages(): array
    {
        return [
            'passed_qty.required' => 'Passed quantity is required.',
            'passed_qty.min' => 'Passed quantity cannot be negative.',
            'failed_qty.required' => 'Failed quantity is required.',
            'failed_qty.min' => 'Failed quantity cannot be negative.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure at least one qty is greater than zero
        $this->merge([
            'passed_qty' => (int) $this->passed_qty,
            'failed_qty' => (int) $this->failed_qty,
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->passed_qty + $this->failed_qty === 0) {
                $validator->errors()->add(
                    'passed_qty',
                    'Total inspected quantity must be greater than zero.'
                );
            }
        });
    }
}
