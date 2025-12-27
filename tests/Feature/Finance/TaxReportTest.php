<?php

use App\Domain\Finance\Services\GenerateTaxReportService;
use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\TaxPeriod;
use App\Models\User;
use App\Models\VendorBill;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(AccountingSeeder::class);
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('can create monthly tax period', function () {
    $period = TaxPeriod::createMonthly(2025, 1);

    expect($period)->toBeInstanceOf(TaxPeriod::class)
        ->and($period->period)->toBe('2025-01')
        ->and($period->status)->toBe('draft')
        ->and((float) $period->input_tax)->toBe(0.0)
        ->and((float) $period->output_tax)->toBe(0.0)
        ->and((float) $period->net_tax)->toBe(0.0);

});

test('calculates input tax from vendor bills', function () {
    $vendor = Contact::factory()->create(['type' => 'vendor']);

    // Create 2 vendor bills with tax
    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'date' => '2025-01-10',
        'status' => 'posted',
        'subtotal' => 90909.09,
        'tax_rate' => 11,
        'tax_amount' => 10000,
        'total_amount' => 100909.09,
    ]);

    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'date' => '2025-01-20',
        'status' => 'posted',
        'subtotal' => 181818.18,
        'tax_rate' => 11,
        'tax_amount' => 20000,
        'total_amount' => 201818.18,
    ]);

    $service = app(GenerateTaxReportService::class);
    $taxPeriod = $service->execute('2025-01');

    expect($taxPeriod->input_tax)->toBe('30000.00')
        ->and($taxPeriod->period)->toBe('2025-01');
});

test('calculates output tax from customer invoices', function () {
    $customer = Contact::factory()->create(['type' => 'customer']);

    // Create 2 customer invoices with tax
    CustomerInvoice::factory()->create([
        'customer_id' => $customer->id,
        'date' => '2025-01-15',
        'status' => 'posted',
        'subtotal' => 272727.27,
        'tax_amount' => 30000,
        'total_amount' => 302727.27,
    ]);

    CustomerInvoice::factory()->create([
        'customer_id' => $customer->id,
        'date' => '2025-01-25',
        'status' => 'posted',
        'subtotal' => 454545.45,
        'tax_amount' => 50000,
        'total_amount' => 504545.45,
    ]);

    $service = app(GenerateTaxReportService::class);
    $taxPeriod = $service->execute('2025-01');

    expect($taxPeriod->output_tax)->toBe('80000.00');
});

test('calculates net tax correctly', function () {
    $vendor = Contact::factory()->create(['type' => 'vendor']);
    $customer = Contact::factory()->create(['type' => 'customer']);

    // Input: 20000
    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'date' => '2025-01-10',
        'status' => 'posted',
        'tax_amount' => 20000,
    ]);

    // Output: 50000
    CustomerInvoice::factory()->create([
        'customer_id' => $customer->id,
        'date' => '2025-01-15',
        'status' => 'posted',
        'tax_amount' => 50000,
    ]);

    $service = app(GenerateTaxReportService::class);
    $taxPeriod = $service->execute('2025-01');

    // Net = Input - Output = 20000 - 50000 = -30000 (negative = payable)
    expect($taxPeriod->net_tax)->toBe('-30000.00')
        ->and($taxPeriod->is_payable)->toBeTrue()
        ->and($taxPeriod->is_claimable)->toBeFalse();
});

test('identifies claimable tax when input exceeds output', function () {
    $vendor = Contact::factory()->create(['type' => 'vendor']);
    $customer = Contact::factory()->create(['type' => 'customer']);

    // Input: 100000
    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'date' => '2025-01-10',
        'status' => 'posted',
        'tax_amount' => 100000,
    ]);

    // Output: 30000
    CustomerInvoice::factory()->create([
        'customer_id' => $customer->id,
        'date' => '2025-01-15',
        'status' => 'posted',
        'tax_amount' => 30000,
    ]);

    $service = app(GenerateTaxReportService::class);
    $taxPeriod = $service->execute('2025-01');

    // Net = Input - Output = 100000 - 30000 = 70000 (positive = claimable)
    expect($taxPeriod->net_tax)->toBe('70000.00')
        ->and($taxPeriod->is_payable)->toBeFalse()
        ->and($taxPeriod->is_claimable)->toBeTrue();
});

test('only includes posted transactions', function () {
    $vendor = Contact::factory()->create(['type' => 'vendor']);

    // Posted bill
    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'date' => '2025-01-10',
        'status' => 'posted',
        'tax_amount' => 10000,
    ]);

    // Draft bill (should not be included)
    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'date' => '2025-01-15',
        'status' => 'draft',
        'tax_amount' => 20000,
    ]);

    $service = app(GenerateTaxReportService::class);
    $taxPeriod = $service->execute('2025-01');

    expect($taxPeriod->input_tax)->toBe('10000.00'); // Only posted
});

test('can submit tax period', function () {
    $period = TaxPeriod::createMonthly(2025, 1);

    $period->submit($this->user, 'SPT filed on 2025-02-15');

    expect($period->fresh()->status)->toBe('submitted')
        ->and($period->fresh()->submitted_by)->toBe($this->user->id)
        ->and($period->fresh()->notes)->toBe('SPT filed on 2025-02-15')
        ->and($period->fresh()->submitted_at)->not->toBeNull();
});

test('cannot submit already submitted period', function () {
    $period = TaxPeriod::createMonthly(2025, 1);
    $period->submit($this->user);

    $period->submit($this->user);
})->throws(DomainException::class, 'already been submitted');

test('detailed transactions include vendor bills', function () {
    $vendor = Contact::factory()->create(['type' => 'vendor', 'name' => 'Test Vendor']);

    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'bill_number' => 'BILL-001',
        'date' => '2025-01-10',
        'status' => 'posted',
        'subtotal' => 90909.09,
        'tax_rate' => 11,
        'tax_amount' => 10000,
    ]);

    $service = app(GenerateTaxReportService::class);
    $taxPeriod = $service->execute('2025-01');
    $details = $service->getDetailedTransactions($taxPeriod);

    expect($details['input_transactions'])->toHaveCount(1)
        ->and($details['input_transactions'][0]['reference'])->toBe('BILL-001')
        ->and($details['input_transactions'][0]['partner'])->toBe('Test Vendor')
        ->and((float) $details['input_transactions'][0]['tax_amount'])->toBe(10000.0);

});

test('regenerating report updates existing period', function () {
    $vendor = Contact::factory()->create(['type' => 'vendor']);

    // First generation
    $service = app(GenerateTaxReportService::class);
    $period1 = $service->execute('2025-01');

    expect($period1->input_tax)->toBe('0.00');

    // Add bills
    VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'date' => '2025-01-10',
        'status' => 'posted',
        'tax_amount' => 15000,
    ]);

    // Regenerate
    $period2 = $service->execute('2025-01');

    expect($period2->id)->toBe($period1->id) // Same period
        ->and($period2->input_tax)->toBe('15000.00'); // Updated
});
