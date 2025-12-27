<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChartOfAccountRequest extends FormRequest
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
        $accountId = $this->route('coa')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('chart_of_accounts', 'code')->ignore($accountId),
                'regex:/^\d{4}$/',
            ],
            'name' => 'required|string|max:255',
            'type' => [
                'required',
                Rule::in(['asset', 'liability', 'equity', 'revenue', 'expense', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
            ],
            'parent_id' => [
                'nullable',
                'exists:chart_of_accounts,id',
                Rule::notIn([$accountId]), // Cannot be its own parent
            ],
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Account code is required.',
            'code.unique' => 'This account code is already in use.',
            'code.regex' => 'Account code can only contain numbers, uppercase letters, and hyphens.',
            'name.required' => 'Account name is required.',
            'type.required' => 'Account type is required.',
            'type.in' => 'Please select a valid account type.',
            'parent_id.exists' => 'The selected parent account does not exist.',
            'parent_id.not_in' => 'An account cannot be its own parent.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'code' => 'account code',
            'name' => 'account name',
            'type' => 'account type',
            'parent_id' => 'parent account',
            'description' => 'description',
            'is_active' => 'active status',
        ];
    }
}
