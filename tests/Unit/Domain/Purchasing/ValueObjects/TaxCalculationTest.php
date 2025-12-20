<?php

use App\Domain\Purchasing\ValueObjects\Money;
use App\Domain\Purchasing\ValueObjects\TaxCalculation;

test('calculates tax for tax-exclusive scenario', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(1_000_000),
        11, // 11% VAT
        0,
        false // tax exclusive
    );
    
    expect($taxCalc->subtotal()->amount())->toBe(1_000_000.0)
        ->and($taxCalc->taxAmount()->amount())->toBe(110_000.0)
        ->and($taxCalc->total()->amount())->toBe(1_110_000.0)
        ->and($taxCalc->netTotal()->amount())->toBe(1_110_000.0);
});

test('calculates tax for tax-inclusive scenario', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(1_110_000),
        11, // 11% VAT
        0,
        true // tax inclusive
    );
    
    expect($taxCalc->subtotal()->amount())->toBe(1_110_000.0)
        ->and($taxCalc->taxAmount()->amount())->toBeGreaterThan(99_000)
        ->and($taxCalc->taxAmount()->amount())->toBeLessThan(101_000)
        ->and($taxCalc->total()->amount())->toBe(1_110_000.0);
});

test('calculates withholding tax correctly', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(10_000_000),
        11, // VAT
        2,  // 2% withholding
        false
    );
    
    expect($taxCalc->withholdingTaxAmount()->amount())->toBe(200_000.0)
        ->and($taxCalc->total()->amount())->toBe(11_100_000.0)
        ->and($taxCalc->netTotal()->amount())->toBe(10_900_000.0);
});

test('provides detailed breakdown', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(5_000_000),
        11,
        2,
        false
    );
    
    $breakdown = $taxCalc->breakdown();
    
    expect($breakdown)->toBeArray()
        ->and($breakdown)->toHaveKeys([
            'subtotal',
            'tax_rate',
            'tax_amount',
            'withholding_tax_rate',
            'withholding_tax_amount',
            'total',
            'net_total',
            'currency',
        ])
        ->and($breakdown['subtotal'])->toBe(5_000_000.0)
        ->and($breakdown['tax_amount'])->toBe(550_000.0)
        ->and($breakdown['withholding_tax_amount'])->toBe(100_000.0);
});

test('throws exception for invalid tax rate', function () {
    TaxCalculation::calculate(
        Money::from(1_000_000),
        150, // Invalid: > 100
        0,
        false
    );
})->throws(InvalidArgumentException::class, 'Tax rate must be between 0 and 100');

test('throws exception for negative withholding tax rate', function () {
    TaxCalculation::calculate(
        Money::from(1_000_000),
        11,
        -5, // Invalid: negative
        false
    );
})->throws(InvalidArgumentException::class, 'Withholding tax rate must be between 0 and 100');

test('handles zero tax rates', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(1_000_000),
        0,
        0,
        false
    );
    
    expect($taxCalc->taxAmount()->amount())->toBe(0.0)
        ->and($taxCalc->withholdingTaxAmount()->amount())->toBe(0.0)
        ->and($taxCalc->total()->amount())->toBe(1_000_000.0)
        ->and($taxCalc->netTotal()->amount())->toBe(1_000_000.0);
});

test('subtotal excluding tax returns correct amount for tax-inclusive', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(1_110_000),
        11,
        0,
        true // tax inclusive
    );
    
    $subtotalExcl = $taxCalc->subtotalExcludingTax()->amount();
    
    // Should be approximately 1,000,000 (original amount before tax)
    expect($subtotalExcl)->toBeGreaterThan(999_000)
        ->and($subtotalExcl)->toBeLessThan(1_001_000);
});

test('subtotal excluding tax same as subtotal for tax-exclusive', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(1_000_000),
        11,
        0,
        false // tax exclusive
    );
    
    expect($taxCalc->subtotalExcludingTax()->amount())
        ->toBe($taxCalc->subtotal()->amount());
});

test('provides formatted string output', function () {
    $taxCalc = TaxCalculation::calculate(
        Money::from(1_000_000),
        11,
        2,
        false
    );
    
    $formatted = $taxCalc->formatted();
    
    expect($formatted)->toContain('Subtotal')
        ->and($formatted)->toContain('Tax (11.00%)')
        ->and($formatted)->toContain('Withholding Tax (2.00%)');
});
