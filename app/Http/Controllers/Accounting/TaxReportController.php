<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Finance\Services\GenerateTaxReportService;
use App\Http\Controllers\Controller;
use App\Models\TaxPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxReportController extends Controller
{
    public function __construct(
        private GenerateTaxReportService $generateTaxReportService
    ) {}

    /**
     * Display a listing of tax periods.
     */
    public function index(Request $request)
    {
        $periods = TaxPeriod::query()
            ->with('submittedByUser')
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->filled('year'), function ($query) use ($request) {
                $year = $request->year;
                $query->whereYear('start_date', $year);
            })
            ->orderByDesc('period')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Accounting/Tax/Report', [
            'periods' => $periods,
            'filters' => $request->only(['status', 'year']),
            'availableYears' => $this->getAvailableYears(),
        ]);
    }

    /**
     * Show detailed tax report for a specific period.
     */
    public function show(string $period)
    {
        $taxPeriod = TaxPeriod::where('period', $period)->firstOrFail();

        // Get detailed transactions
        $details = $this->generateTaxReportService->getDetailedTransactions($taxPeriod);

        return Inertia::render('Accounting/Tax/Detail', [
            'taxPeriod' => $taxPeriod->load('submittedByUser'),
            'inputTransactions' => $details['input_transactions'],
            'outputTransactions' => $details['output_transactions'],
            'summary' => $details['summary'],
        ]);
    }

    /**
     * Generate or regenerate tax report for a period.
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'period' => 'required|date_format:Y-m',
        ]);

        try {
            $taxPeriod = $this->generateTaxReportService->execute($validated['period']);

            return redirect()->route('accounting.tax.periods')
                ->with('success', "Tax report for {$taxPeriod->period} generated successfully. Input Tax: Rp ".number_format($taxPeriod->input_tax, 0, ',', '.').', Output Tax: Rp '.number_format($taxPeriod->output_tax, 0, ',', '.'));
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Submit tax period (mark as submitted).
     */
    public function submit(Request $request, string $period)
    {
        $taxPeriod = TaxPeriod::where('period', $period)->firstOrFail();

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $taxPeriod->submit(
                $request->user(),
                $validated['notes'] ?? null
            );

            return back()->with('success', "Tax period {$taxPeriod->period} has been marked as submitted.");
        } catch (\DomainException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Export tax report to PDF/CSV.
     */
    public function export(string $period, string $format = 'pdf')
    {
        $taxPeriod = TaxPeriod::where('period', $period)->firstOrFail();
        $details = $this->generateTaxReportService->getDetailedTransactions($taxPeriod);

        if ($format === 'csv') {
            return $this->exportCsv($taxPeriod, $details);
        }

        // For now, return a placeholder for PDF
        return back()->with('info', 'PDF export will be implemented next');
    }

    /**
     * Export to CSV format.
     */
    private function exportCsv(TaxPeriod $taxPeriod, array $details)
    {
        $filename = "tax_report_{$taxPeriod->period}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($taxPeriod, $details) {
            $file = fopen('php://output', 'w');

            // Header
            fputcsv($file, ['Tax Report - Period: '.$taxPeriod->period]);
            fputcsv($file, ['Generated: '.now()->format('Y-m-d H:i:s')]);
            fputcsv($file, []);

            // Summary
            fputcsv($file, ['Summary']);
            fputcsv($file, ['Input Tax (PPN Masukan)', number_format($taxPeriod->input_tax, 2)]);
            fputcsv($file, ['Output Tax (PPN Keluaran)', number_format($taxPeriod->output_tax, 2)]);
            fputcsv($file, ['Net Tax', number_format($taxPeriod->net_tax, 2)]);
            fputcsv($file, ['Status', $taxPeriod->is_payable ? 'Payable' : 'Claimable']);
            fputcsv($file, []);

            // Input Transactions
            fputcsv($file, ['PPN INPUT (FROM VENDOR BILLS)']);
            fputcsv($file, ['Date', 'Reference', 'Vendor', 'Base Amount', 'Tax Rate', 'Tax Amount']);
            foreach ($details['input_transactions'] as $transaction) {
                fputcsv($file, [
                    $transaction['date'],
                    $transaction['reference'],
                    $transaction['partner'],
                    number_format($transaction['base_amount'], 2),
                    $transaction['tax_rate'].'%',
                    number_format($transaction['tax_amount'], 2),
                ]);
            }
            fputcsv($file, []);

            // Output Transactions
            fputcsv($file, ['PPN OUTPUT (FROM CUSTOMER INVOICES)']);
            fputcsv($file, ['Date', 'Reference', 'Customer', 'Base Amount', 'Tax Rate', 'Tax Amount']);
            foreach ($details['output_transactions'] as $transaction) {
                fputcsv($file, [
                    $transaction['date'],
                    $transaction['reference'],
                    $transaction['partner'],
                    number_format($transaction['base_amount'], 2),
                    $transaction['tax_rate'].'%',
                    number_format($transaction['tax_amount'], 2),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get available years for filtering.
     */
    private function getAvailableYears(): array
    {
        // Use database-agnostic approach
        $years = TaxPeriod::all()
            ->map(fn ($period) => (int) \Carbon\Carbon::parse($period->start_date)->year)
            ->unique()
            ->sort()
            ->reverse()
            ->values()
            ->toArray();

        // Add current year if not present
        $currentYear = (int) now()->year;
        if (! in_array($currentYear, $years)) {
            $years[] = $currentYear;
            sort($years);
            $years = array_reverse($years);
        }

        return $years;
    }
}
