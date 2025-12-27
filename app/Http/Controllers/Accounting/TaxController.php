<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaxController extends Controller
{
    /**
     * Display tax management dashboard
     */
    public function index(): Response
    {
        $taxSummary = $this->getTaxSummary();

        return Inertia::render('Accounting/Tax/Index', [
            'taxSummary' => $taxSummary,
        ]);
    }

    /**
     * VAT/PPN Management
     */
    public function vat(Request $request): Response
    {
        $period = $request->input('period', date('Y-m'));

        // Simplified VAT calculation from journal entries
        $vatTransactions = $this->getVATTransactions($period);

        return Inertia::render('Accounting/Tax/VAT', [
            'period' => $period,
            'vatTransactions' => $vatTransactions,
            'summary' => [
                'output_vat' => $vatTransactions['output_vat'] ?? 0,
                'input_vat' => $vatTransactions['input_vat'] ?? 0,
                'payable' => ($vatTransactions['output_vat'] ?? 0) - ($vatTransactions['input_vat'] ?? 0),
            ],
        ]);
    }

    /**
     * Withholding Tax (PPh) Management
     */
    public function withholding(Request $request): Response
    {
        $period = $request->input('period', date('Y-m'));

        $withholdingData = $this->getWithholdingTax($period);

        return Inertia::render('Accounting/Tax/Withholding', [
            'period' => $period,
            'withholdingData' => $withholdingData,
        ]);
    }

    /**
     * Tax reporting
     */
    public function reports(): Response
    {
        return Inertia::render('Accounting/Tax/Reports', [
            'availableReports' => [
                ['id' => 'vat_1111', 'name' => 'SPT Masa PPN 1111'],
                ['id' => 'pph21', 'name' => 'SPT Masa PPh 21'],
                ['id' => 'pph23', 'name' => 'SPT Masa PPh 23'],
                ['id' => 'pph4_2', 'name' => 'SPT Masa PPh 4(2)'],
            ],
        ]);
    }

    /**
     * Get tax summary
     */
    private function getTaxSummary(): array
    {
        return [
            'vat_payable' => 0, // Calculate from transactions
            'withholding_payable' => 0,
            'pending_submissions' => 0,
        ];
    }

    /**
     * Get VAT transactions for period
     */
    private function getVATTransactions(string $period): array
    {
        // Simplified - in production, query from VAT-tagged transactions
        return [
            'output_vat' => 0, // Sales VAT
            'input_vat' => 0,  // Purchase VAT
        ];
    }

    /**
     * Get withholding tax data
     */
    private function getWithholdingTax(string $period): array
    {
        return [
            'pph21' => 0,
            'pph23' => 0,
            'pph4_2' => 0,
        ];
    }
}
