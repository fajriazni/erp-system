<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contacts = [
            [
                'type' => 'customer',
                'name' => 'PT Maju Bersama',
                'email' => 'contact@majubersama.com',
                'phone' => '021-555001',
                'address' => 'Gedung A, Lt. 2, Jakarta Selatan',
                'tax_id' => '12.345.678.9-001.000',
            ],
            [
                'type' => 'vendor',
                'name' => 'CV Supplier Jaya',
                'email' => 'sales@supplierjaya.com',
                'phone' => '021-666002',
                'address' => 'Kawasan Industri B, Bekasi',
                'tax_id' => '98.765.432.1-002.000',
            ],
            [
                'type' => 'both',
                'name' => 'Toko Kelontong Sejahtera',
                'email' => 'owner@tokosejahtera.com',
                'phone' => '08123456789',
                'address' => 'Jl. Pasar Baru No. 10',
                'tax_id' => null,
            ],
            [
                'type' => 'customer',
                'name' => 'Budi Santoso',
                'email' => 'budi.s@email.com',
                'phone' => '08987654321',
                'address' => 'Perumahan Indah Blok C',
                'tax_id' => null,
            ],
        ];

        foreach ($contacts as $contact) {
            Contact::firstOrCreate(['email' => $contact['email']], $contact);
        }
    }
}
