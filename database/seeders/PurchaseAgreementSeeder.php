<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\PurchaseAgreement;
use App\Models\BlanketOrder;
use App\Models\Product;
use Illuminate\Database\Seeder;

class PurchaseAgreementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have vendors
        if (Contact::where('type', 'vendor')->doesntExist()) {
             $this->call(ContactSeeder::class);
        }

        // Get some vendors
        $vendors = Contact::where('type', 'vendor')->limit(3)->get();
        if ($vendors->isEmpty()) {
            return;
        }

        // Create a basic Draft Agreement
        if (PurchaseAgreement::where('reference_number', 'PA-' . date('Y') . '-001')->doesntExist()) {
            PurchaseAgreement::factory()->create([
                'vendor_id' => $vendors->first()->id,
                'title' => 'Office Supplies Annual Contract',
                'status' => 'draft',
                'reference_number' => 'PA-' . date('Y') . '-001',
                'total_value_cap' => 100000000,
            ]);
        }

        // Create an Active Agreement setup
        $activeVendor = $vendors->count() > 1 ? $vendors[1] : $vendors->first();
        $refNo = 'MM-AG-' . date('Y') . '-008';
        
        $agreement = PurchaseAgreement::firstOrCreate(
            ['reference_number' => $refNo],
            [
                'vendor_id' => $activeVendor->id,
                'title' => 'IT Equipment Maintenance Framework',
                'status' => 'active',
                'start_date' => now()->startOfYear(),
                'end_date' => now()->endOfYear(),
                'total_value_cap' => 500000000,
                'is_auto_renew' => true,
            ]
        );

        // Create a Linked Blanket Order for this active agreement
        if (Product::exists() && BlanketOrder::where('number', 'BPO-' . $agreement->reference_number . '-01')->doesntExist()) {
            $products = Product::inRandomOrder()->limit(3)->get();
            
            $bpo = BlanketOrder::create([
                'vendor_id' => $activeVendor->id,
                'purchase_agreement_id' => $agreement->id,
                'number' => 'BPO-' . $agreement->reference_number . '-01',
                'start_date' => $agreement->start_date,
                'end_date' => $agreement->end_date,
                'status' => 'open',
                'amount_limit' => 200000000,
            ]);

            foreach ($products as $product) {
                $bpo->lines()->create([
                    'product_id' => $product->id,
                    'unit_price' => $product->cost_price * 0.95, // 5% discount
                    'quantity_agreed' => 100,
                    'quantity_ordered' => 0,
                ]);
            }
        }

        $this->command->info('Created sample Purchase Agreements and Blanket Orders.');
    }
}
