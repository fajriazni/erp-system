<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            ['code' => 'IDR', 'name' => 'Indonesian Rupiah', 'symbol' => 'Rp'],
            ['code' => 'USD', 'name' => 'United States Dollar', 'symbol' => '$'],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€'],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'symbol' => 'S$'],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£'],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'A$'],
        ];

        foreach ($currencies as $currency) {
            \App\Models\Currency::create($currency);
        }

        // Seed initial Rate: 1 USD = 15000 IDR
        \App\Models\ExchangeRate::create([
            'from_currency' => 'USD',
            'to_currency' => 'IDR',
            'rate' => 15000,
            'effective_date' => now(),
        ]);
        
         // Seed initial Rate: 1 SGD = 11000 IDR
         \App\Models\ExchangeRate::create([
            'from_currency' => 'SGD',
            'to_currency' => 'IDR',
            'rate' => 11000,
            'effective_date' => now(),
        ]);
    }
}
