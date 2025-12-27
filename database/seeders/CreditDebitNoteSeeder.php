<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\CreditDebitNote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CreditDebitNoteSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Credit Notes for Customers
        $customers = Contact::where('type', 'customer')->inRandomOrder()->take(3)->get();
        if ($customers->isEmpty()) {
            $this->command->info('No customers found. Skipping Credit Note seeding.');
        } else {
            foreach ($customers as $customer) {
                // Create 2 draft credit notes per customer
                for ($i = 0; $i < 2; $i++) {
                    CreditDebitNote::create([
                        'type' => 'credit',
                        'reference_number' => 'CN-'.strtoupper(Str::random(6)),
                        'date' => now()->subDays(rand(1, 30)),
                        'contact_id' => $customer->id,
                        'amount' => rand(100000, 5000000),
                        'remaining_amount' => 0, // Draft has 0 remaining until posted
                        'reason' => 'Sample Credit Note for '.$customer->name,
                        'status' => 'draft',
                    ]);
                }
            }
            $this->command->info('Credit Notes seeded.');
        }

        // 2. Debit Notes for Vendors
        $vendors = Contact::where('type', 'vendor')->inRandomOrder()->take(3)->get();
        if ($vendors->isEmpty()) {
            $this->command->info('No vendors found. Skipping Debit Note seeding.');
        } else {
            foreach ($vendors as $vendor) {
                // Create 2 draft debit notes per vendor
                for ($i = 0; $i < 2; $i++) {
                    CreditDebitNote::create([
                        'type' => 'debit',
                        'reference_number' => 'DN-'.strtoupper(Str::random(6)),
                        'date' => now()->subDays(rand(1, 30)),
                        'contact_id' => $vendor->id,
                        'amount' => rand(100000, 5000000),
                        'remaining_amount' => 0, // Draft has 0 remaining until posted
                        'reason' => 'Sample Debit Note for '.$vendor->name,
                        'status' => 'draft',
                    ]);
                }
            }
            $this->command->info('Debit Notes seeded.');
        }
    }
}
