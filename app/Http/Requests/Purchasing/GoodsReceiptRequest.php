<?php

namespace App\Http\Requests\Purchasing;

use Illuminate\Foundation\Http\FormRequest;

class GoodsReceiptRequest extends FormRequest
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
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'receipt_number' => ['required', 'string', 'max:255', 'unique:goods_receipts,receipt_number,'.$this->route('receipt')],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.uom_id' => ['required', 'exists:uoms,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom error messages for validator.
     */
    public function messages(): array
    {
        return [
            'purchase_order_id.required' => 'Please select a purchase order.',
            'purchase_order_id.exists' => 'The selected purchase order does not exist.',
            'warehouse_id.required' => 'Please select a warehouse.',
            'warehouse_id.exists' => 'The selected warehouse does not exist.',
            'receipt_number.required' => 'Receipt number is required.',
            'receipt_number.unique' => 'This receipt number is already in use.',
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
            'items.*.quantity.required' => 'Quantity is required for all items.',
            'items.*.quantity.min' => 'Quantity must be greater than zero.',
        ];
    }
}
