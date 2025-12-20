<?php

namespace App\Http\Requests\Purchasing;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');
        
        // Only draft orders can be edited
        if ($order && !$order->canBeEdited()) {
            return false;
        }
        
        // Allow any authenticated user to edit draft POs
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => ['sometimes', 'required', 'exists:contacts,id'],
            'warehouse_id' => ['sometimes', 'required', 'exists:warehouses,id'],
            'date' => ['sometimes', 'required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_term_id' => ['nullable', 'exists:payment_terms,id'],
            
            // Tax configuration
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'withholding_tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tax_inclusive' => ['nullable', 'boolean'],
            
            // Items
            'items' => ['sometimes', 'required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.description' => ['nullable', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'vendor_id.required' => 'Please select a vendor.',
            'vendor_id.exists' => 'The selected vendor does not exist.',
            'warehouse_id.required' => 'Please select a warehouse.',
            'warehouse_id.exists' => 'The selected warehouse does not exist.',
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
            'items.*.product_id.required' => 'Product is required for each item.',
            'items.*.product_id.exists' => 'One or more selected products do not exist.',
            'items.*.quantity.required' => 'Quantity is required for each item.',
            'items.*.quantity.min' => 'Quantity must be greater than 0.',
            'items.*.unit_price.required' => 'Unit price is required for each item.',
            'items.*.unit_price.min' => 'Unit price cannot be negative.',
        ];
    }
}
