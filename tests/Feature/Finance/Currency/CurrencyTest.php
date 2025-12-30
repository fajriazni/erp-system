<?php

namespace Tests\Feature\Finance\Currency;

use App\Domain\Finance\Services\CurrencyService;
use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CurrencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
        $this->seed(\Database\Seeders\CurrencySeeder::class);
    }

    public function test_can_view_currency_page()
    {
        $response = $this->get(route('finance.currency.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Finance/Currency/Index')
            ->has('currencies')
            ->has('latestRates')
        );
    }

    public function test_can_create_new_currency()
    {
        $response = $this->post(route('finance.currency.store'), [
            'code' => 'JPY',
            'name' => 'Japanese Yen',
            'symbol' => '¥'
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('currencies', ['code' => 'JPY']);
    }

    public function test_can_update_exchange_rate()
    {
        $response = $this->post(route('finance.currency.rate.store'), [
            'from_currency' => 'USD',
            'to_currency' => 'IDR',
            'rate' => 15500,
            'effective_date' => now()->toDateString(),
        ]);

        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('exchange_rates', [
            'from_currency' => 'USD',
            'to_currency' => 'IDR',
            'rate' => 15500,
        ]);
    }

    public function test_currency_conversion_service()
    {
        $service = new CurrencyService();
        $date = now()->toDateString();
        
        // Ensure rate exists explicitly
         ExchangeRate::updateOrCreate([
            'from_currency' => 'USD',
            'to_currency' => 'IDR',
            'effective_date' => $date, // Explicit date
        ], ['rate' => 15000]);
        
        // 1 USD = 15000 IDR (Seeded)
        $converted = $service->convert(100, 'USD', 'IDR', $date);
        $this->assertEquals(1500000, $converted);

        // Same currency
        $converted = $service->convert(500, 'IDR', 'IDR');
        $this->assertEquals(500, $converted);

        // Update rate and test again
        ExchangeRate::create([
            'from_currency' => 'USD',
            'to_currency' => 'IDR',
            'rate' => 16000,
            'effective_date' => now()->addDay()->toDateString(),
        ]);

        // Future date lookup
        $futureConverted = $service->convert(100, 'USD', 'IDR', now()->addDay()->toDateString());
        $this->assertEquals(1600000, $futureConverted);
    }
}
