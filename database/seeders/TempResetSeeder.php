<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\BlanketOrder;
use App\Models\BlanketOrderLine;
use App\Models\PurchaseAgreement;
use App\Models\PurchaseAgreementLine;
use App\Models\PurchaseOrder;
use App\Models\Contact;
use App\Models\Product;

class TempResetSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        BlanketOrderLine::truncate();
        PurchaseOrder::query()->update(['blanket_order_id' => null]);
        BlanketOrder::truncate();
        PurchaseAgreementLine::truncate();
        PurchaseAgreement::truncate();
        Schema::enableForeignKeyConstraints();

        $this->call(PurchaseAgreementSeeder::class);

        $vendors = Contact::where('type', 'vendor')->get();
        $products = Product::limit(10)->get();

        if ($vendors->count() > 0 && $products->count() > 0) {
            // 5 Draft BPOs
            BlanketOrder::factory()->count(5)->create([
                'vendor_id' => fn() => $vendors->random()->id,
                'status' => 'draft',
            ]);

            // 3 Open BPOs with lines
            BlanketOrder::factory()->count(3)->create([
                'vendor_id' => fn() => $vendors->random()->id,
                'status' => 'open',
            ])->each(function($bpo) use ($products) {
                 foreach($products->random(2) as $prod) {
                     $bpo->lines()->create([
                        'product_id' => $prod->id,
                        'unit_price' => $prod->price * 0.9,
                        'quantity_agreed' => 5000,
                        'quantity_ordered' => 0
                     ]);
                 }
            });

            // 2 Pending Approval BPOs
            BlanketOrder::factory()->count(2)->create([
                'vendor_id' => fn() => $vendors->random()->id,
                'status' => 'pending_approval',
            ]);
            
             // 2 Closed BPOs
            BlanketOrder::factory()->count(2)->create([
                'vendor_id' => fn() => $vendors->random()->id,
                'status' => 'closed',
            ]);
        }
    }
}
