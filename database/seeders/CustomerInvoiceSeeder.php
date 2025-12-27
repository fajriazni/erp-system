<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\CustomerInvoiceLine;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CustomerInvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have customers
        $customers = Contact::whereIn('type', ['customer', 'both'])->get();
        if ($customers->count() === 0) {
            $customers = Contact::factory()->count(5)->create(['type' => 'customer']);
        }

        // Ensure we have products
        $products = Product::all();
        if ($products->count() === 0) {
            $products = Product::factory()->count(10)->create();
        }

        // Create 50 customer invoices with varying statuses
        foreach ($customers as $customer) {
            // Each customer gets multiple invoices
            for ($i = 0; $i < 10; $i++) {
                $status = fake()->randomElement(['draft', 'draft', 'posted', 'posted', 'posted', 'paid']);

                $invoice = CustomerInvoice::create([
                    'customer_id' => $customer->id,
                    'invoice_number' => 'INV/'.date('Y').'/'.str_pad(CustomerInvoice::count() + 1, 3, '0', STR_PAD_LEFT),
                    'date' => fake()->dateTimeBetween('-6 months', 'now'),
                    'due_date' => fake()->dateTimeBetween('now', '+30 days'),
                    'status' => $status,
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'total_amount' => 0,
                    'posted_at' => in_array($status, ['posted', 'paid']) ? now() : null,
                    'journal_entry_id' => null,
                ]);

                // Add 2-5 invoice lines
                $lineCount = fake()->numberBetween(2, 5);
                $subtotal = 0;

                for ($j = 0; $j < $lineCount; $j++) {
                    $product = $products->random();
                    $quantity = fake()->numberBetween(1, 10);
                    $unitPrice = fake()->randomFloat(2, 10, 1000);
                    $lineSubtotal = $quantity * $unitPrice;
                    $subtotal += $lineSubtotal;

                    CustomerInvoiceLine::create([
                        'customer_invoice_id' => $invoice->id,
                        'product_id' => $product->id,
                        'description' => $product->name.' - '.fake()->sentence(3),
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $lineSubtotal,
                    ]);
                }

                // Calculate tax and total
                $taxAmount = $subtotal * 0.11; // 11% VAT
                $totalAmount = $subtotal + $taxAmount;

                $invoice->update([
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                ]);
            }
        }
    }
}
