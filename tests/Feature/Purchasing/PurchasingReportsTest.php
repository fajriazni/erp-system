<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\PurchaseOrder;
use App\Models\VendorBill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PurchasingReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_spend_analysis_calculation()
    {
        Carbon::setTestNow('2024-06-01');

        $vendor = Contact::factory()->create(['type' => 'vendor']);

        // Create POs in different months
        PurchaseOrder::factory()->create([
            'vendor_id' => $vendor->id,
            'status' => 'purchase_order',
            'date' => '2024-01-15',
            'total' => 1000,
        ]);

        PurchaseOrder::factory()->create([
            'vendor_id' => $vendor->id,
            'status' => 'closed',
            'date' => '2024-02-20',
            'total' => 2000,
        ]);

        // Ignored status
        PurchaseOrder::factory()->create([
            'vendor_id' => $vendor->id,
            'status' => 'draft',
            'date' => '2024-03-10',
            'total' => 5000,
        ]);

        $service = new \App\Domain\Purchasing\Services\Stats\GetSpendAnalysisService;
        $result = $service->execute(6);

        // Result should cover Jan, Feb, Mar, Apr, May, June (6 months leading to June)
        // Actually execute(6) from June 1st likely starts Dec or Jan depending on logic.
        // Logic: now()->subMonths(5)->startOfMonth() -> Jan 2024.

        $this->assertCount(6, $result);

        // Check Jan
        $jan = collect($result)->firstWhere('key', '2024-01');
        $this->assertEquals(1000, $jan['amount']);

        // Check Feb
        $feb = collect($result)->firstWhere('key', '2024-02');
        $this->assertEquals(2000, $feb['amount']);

        // Check Mar (Should be 0 because status is draft)
        $mar = collect($result)->firstWhere('key', '2024-03');
        $this->assertEquals(0, $mar['amount']);
    }

    public function test_payable_aging_calculation()
    {
        Carbon::setTestNow('2024-06-01');

        $vendor = Contact::factory()->create(['type' => 'vendor']);

        // Current (0-30 days old): Date 2024-05-20 (12 days old)
        VendorBill::factory()->create([
            'vendor_id' => $vendor->id,
            'status' => 'posted',
            'date' => '2024-05-20',
            'due_date' => '2024-06-20',
            'total_amount' => 1000,
        ]);

        // 31-60 days old: Date 2024-04-15 (47 days old)
        VendorBill::factory()->create([
            'vendor_id' => $vendor->id,
            'status' => 'posted',
            'date' => '2024-04-15',
            'due_date' => '2024-05-15',
            'total_amount' => 2000,
        ]);

        // Paid bill (should not count)
        $paidBill = VendorBill::factory()->create([
            'vendor_id' => $vendor->id,
            'status' => 'posted',
            'date' => '2024-04-10',
            'total_amount' => 5000,
        ]);

        // Create payment for the paid bill
        \App\Models\VendorPaymentLine::factory()->create([
            'vendor_bill_id' => $paidBill->id,
            'amount' => 5000,
        ]);

        $service = new \App\Domain\Purchasing\Services\Stats\GetPayableAgingService;
        $result = $service->execute();

        $this->assertEquals(1000, $result['0-30']);
        $this->assertEquals(2000, $result['31-60']);
        $this->assertEquals(0, $result['61-90']);
    }

    public function test_reports_page_load()
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->get(route('purchasing.reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Purchasing/reports/index')
            ->has('spendData')
            ->has('agingData')
            ->has('topVendors')
        );
    }
}
