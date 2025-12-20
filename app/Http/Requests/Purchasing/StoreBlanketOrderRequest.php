<?php

namespace App\Http\Requests\Purchasing;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlanketOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => 'required|exists:contacts,id',
            'purchase_agreement_id' => 'nullable|exists:purchase_agreements,id',
            'number' => 'required|string|unique:blanket_orders,number',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'amount_limit' => 'required|numeric|min:0',
            'status' => 'required|in:draft,active,closed',
            'lines' => 'array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.unit_price' => 'required|numeric|min:0',
            'lines.*.quantity_agreed' => 'nullable|numeric|min:0',
            'renewal_reminder_days' => 'nullable|integer|min:0',
            'is_auto_renew' => 'boolean',
        ];
    }
}
