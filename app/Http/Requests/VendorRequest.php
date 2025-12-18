<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendorRequest extends FormRequest
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
            // Basic Information
            'type' => 'required|in:vendor,customer,both',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:100',
            
            // Payment Terms
            'payment_term_id' => 'nullable|exists:payment_terms,id',
            
            // Business Details
            'company_registration_no' => 'nullable|string|max:100',
            'established_year' => 'nullable|integer|min:1800|max:'.(date('Y') + 1),
            'employee_count' => 'nullable|integer|min:1',
            'website' => 'nullable|url|max:255',
            'notes' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'industry' => 'nullable|string|max:100',
            
            // Banking Information
            'bank_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:100',
            'bank_account_holder' => 'nullable|string|max:255',
            'bank_swift_code' => 'nullable|string|max:50',
            'currency' => 'nullable|string|size:3',
            
            // Status
            'status' => 'nullable|in:active,inactive,blacklist',
            
            // JSON Fields
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            
            'documents' => 'nullable|array',
            'documents.*.type' => 'required|string',
            'documents.*.name' => 'required|string',
            'documents.*.url' => 'required|string',
            
            'contact_persons' => 'nullable|array',
            'contact_persons.*.name' => 'required|string|max:255',
            'contact_persons.*.position' => 'nullable|string|max:100',
            'contact_persons.*.email' => 'nullable|email|max:255',
            'contact_persons.*.phone' => 'nullable|string|max:50',
            'contact_persons.*.is_primary' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Contact type is required',
            'type.in' => 'Contact type must be vendor, customer, or both',
            'name.required' => 'Company name is required',
            'email.email' => 'Please provide a valid email address',
            'established_year.min' => 'Established year must be after 1800',
            'established_year.max' => 'Established year cannot be in the future',
            'website.url' => 'Please provide a valid website URL',
            'currency.size' => 'Currency code must be 3 characters (e.g., IDR, USD)',
            'contact_persons.*.name.required' => 'Contact person name is required',
            'contact_persons.*.email.email' => 'Please provide a valid email for contact person',
        ];
    }
}
