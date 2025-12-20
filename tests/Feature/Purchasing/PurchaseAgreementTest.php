<?php

namespace Tests\Feature\Purchasing;

use App\Models\User;
use App\Models\Contact;
use App\Models\PurchaseAgreement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class PurchaseAgreementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_can_view_purchase_agreements_index()
    {
        $user = User::factory()->create();
        // Create vendor explicitly to satisfy relation if needed, though factory handles it usually?
        // Wait, PurchaseAgreement factory probably needs a vendor_id.
        // Let's assume PurchaseAgreement factory creates a Contact.
        PurchaseAgreement::factory()->count(3)->create();

        $response = $this->actingAs($user)->get(route('purchasing.contracts.index'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Purchasing/Contracts/Index')
                ->has('agreements.data', 3)
            );
    }

    public function test_can_view_create_purchase_agreement_page()
    {
        $user = User::factory()->create();
        Contact::factory()->count(3)->create(['type' => 'vendor']);

        $response = $this->actingAs($user)->get(route('purchasing.contracts.create'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Purchasing/Contracts/Create')
                ->has('vendors', 3)
            );
    }

    public function test_can_create_purchase_agreement()
    {
        $user = User::factory()->create();
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $file = UploadedFile::fake()->create('contract.pdf', 100);

        $response = $this->actingAs($user)->post(route('purchasing.contracts.store'), [
            'vendor_id' => $vendor->id,
            'reference_number' => 'CTR-2025-TEST',
            'title' => 'Test Agreement',
            'start_date' => '2025-01-01',
            'status' => 'active',
            'document' => $file,
        ]);

        $response->assertRedirect(route('purchasing.contracts.index'));
        
        $this->assertDatabaseHas('purchase_agreements', [
            'reference_number' => 'CTR-2025-TEST',
            'title' => 'Test Agreement',
            'vendor_id' => $vendor->id,
        ]);

        $agreement = PurchaseAgreement::where('reference_number', 'CTR-2025-TEST')->first();
        $this->assertNotNull($agreement->document_path);
        Storage::disk('public')->assertExists($agreement->document_path);
    }

    public function test_can_view_purchase_agreement_details()
    {
        $user = User::factory()->create();
        $agreement = PurchaseAgreement::factory()->create();

        $response = $this->actingAs($user)->get(route('purchasing.contracts.show', $agreement));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Purchasing/Contracts/Show')
                ->where('agreement.id', $agreement->id)
                ->where('agreement.title', $agreement->title)
            );
    }

    public function test_can_view_edit_purchase_agreement_page()
    {
        $user = User::factory()->create();
        $agreement = PurchaseAgreement::factory()->create();
        Contact::factory()->create(['type' => 'vendor']);

        $response = $this->actingAs($user)->get(route('purchasing.contracts.edit', $agreement));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Purchasing/Contracts/Edit')
                ->where('agreement.id', $agreement->id)
            );
    }

    public function test_can_update_purchase_agreement()
    {
        $user = User::factory()->create();
        $agreement = PurchaseAgreement::factory()->create();
        
        $response = $this->actingAs($user)->put(route('purchasing.contracts.update', $agreement), [
            'vendor_id' => $agreement->vendor_id,
            'reference_number' => $agreement->reference_number,
            'title' => 'Updated Title',
            'start_date' => $agreement->start_date,
            'status' => 'expired',
        ]);

        $response->assertRedirect(route('purchasing.contracts.index'));
        
        $this->assertDatabaseHas('purchase_agreements', [
            'id' => $agreement->id,
            'title' => 'Updated Title',
            'status' => 'expired',
        ]);
    }

    public function test_can_delete_purchase_agreement()
    {
        $user = User::factory()->create();
        $agreement = PurchaseAgreement::factory()->create();

        $response = $this->actingAs($user)->delete(route('purchasing.contracts.destroy', $agreement));

        $response->assertRedirect(route('purchasing.contracts.index'));
        
        $this->assertDatabaseMissing('purchase_agreements', [
            'id' => $agreement->id,
        ]);
    }
}
