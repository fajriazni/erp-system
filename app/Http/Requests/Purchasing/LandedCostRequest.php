<?php

namespace App\Http\Requests\Purchasing;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LandedCostRequest extends FormRequest
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
            'cost_type' => ['required', 'string', Rule::in(['freight', 'insurance', 'customs', 'handling', 'other'])],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'allocation_method' => ['required', 'string', Rule::in(['by_value', 'by_quantity', 'by_weight'])],
            'expense_account_id' => ['nullable', 'exists:chart_of_accounts,id'],
            'reference_number' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom error messages for validator.
     */
    public function messages(): array
    {
        return [
            'cost_type.required' => 'Cost type is required.',
            'cost_type.in' => 'Invalid cost type selected.',
            'description.required' => 'Description is required.',
            'amount.required' => 'Amount is required.',
            'amount.min' => 'Amount must be greater than zero.',
            'allocation_method.required' => 'Allocation method is required.',
            'allocation_method.in' => 'Invalid allocation method selected.',
        ];
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);

        // Set default allocation method if not provided
        $data['allocation_method'] = $data['allocation_method'] ?? 'by_value';

        return $data;
    }
}
