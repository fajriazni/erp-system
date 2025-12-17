<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorPricelist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricelistTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_view_pricelist_index()
    {
        $this->actingAs($this->user)
            ->get(route('purchasing.pricelists.index'))
            ->assertStatus(200);
    }

    public function test_can_create_pricelist()
    {
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('purchasing.pricelists.store'), [
                'vendor_id' => $vendor->id,
                'product_id' => $product->id,
                'price' => 5000,
                'min_quantity' => 1,
            ]);

        $response->assertRedirect(route('purchasing.pricelists.index'));
        $this->assertDatabaseHas('vendor_pricelists', [
            'vendor_id' => $vendor->id,
            'product_id' => $product->id,
            'price' => 5000,
        ]);
    }

    public function test_get_price_api_returns_correct_tier_price()
    {
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $product = Product::factory()->create(['cost' => 10000]);

        // Tier 1: Buy 1+ for 9000
        VendorPricelist::create([
            'vendor_id' => $vendor->id,
            'product_id' => $product->id,
            'min_quantity' => 1,
            'price' => 9000,
        ]);

        // Tier 2: Buy 100+ for 8000
        VendorPricelist::create([
            'vendor_id' => $vendor->id,
            'product_id' => $product->id,
            'min_quantity' => 100,
            'price' => 8000,
        ]);

        // Case 1: Quantity 1 -> Should get 9000
        $response1 = $this->actingAs($this->user)
            ->getJson(route('purchasing.pricelists.get-price', [
                'vendor_id' => $vendor->id,
                'product_id' => $product->id,
                'quantity' => 1,
            ]));

        $response1->assertOk()->assertJson(['price' => 9000]);

        // Case 2: Quantity 150 -> Should get 8000
        $response2 = $this->actingAs($this->user)
            ->getJson(route('purchasing.pricelists.get-price', [
                'vendor_id' => $vendor->id,
                'product_id' => $product->id,
                'quantity' => 150,
            ]));

        $response2->assertOk()->assertJson(['price' => 8000]);

        // Case 3: Other vendor -> Should fallback to product cost (10000)
        $otherVendor = Contact::factory()->create(['type' => 'vendor']);
        $response3 = $this->actingAs($this->user)
            ->getJson(route('purchasing.pricelists.get-price', [
                'vendor_id' => $otherVendor->id,
                'product_id' => $product->id,
                'quantity' => 1,
            ]));

        $response3->assertOk()->assertJson(['price' => 10000]);
    }
}
