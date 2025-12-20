<?php

namespace App\Http\Requests\Purchasing;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => 'required|exists:contacts,id',
            'reference_number' => 'required|string|unique:purchase_agreements,reference_number',
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:draft,pending_approval,active,expired,terminated',
            'total_value_cap' => 'nullable|numeric|min:0',
            'document' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240',
            'renewal_reminder_days' => 'nullable|integer|min:0',
            'is_auto_renew' => 'boolean',
        ];
    }
}
