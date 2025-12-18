<?php

namespace App\Domain\Finance\Queries;

use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;
use Carbon\Carbon;

class GetTaxReportQuery
{
    public function execute(?string $startDate, ?string $endDate)
    {
        $start = $startDate ? Carbon::parse($startDate) : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfMonth();

        // 1. Get Accounts
        // Input Tax (Receivable)
        $inputTaxAccount = ChartOfAccount::where('code', '1500')->first();
        // Output Tax (Payable)
        $outputTaxAccount = ChartOfAccount::where('code', '2200')->first();

        if (! $inputTaxAccount || ! $outputTaxAccount) {
            return [
                'input_tax' => 0,
                'output_tax' => 0,
                'net_tax' => 0,
                'details' => [],
            ];
        }

        // 2. Query Lines
        $inputTaxLines = JournalEntryLine::where('chart_of_account_id', $inputTaxAccount->id)
            ->whereHas('journalEntry', function ($q) use ($start, $end) {
                $q->whereBetween('date', [$start, $end]);
            })
            ->with('journalEntry')
            ->get();

        $outputTaxLines = JournalEntryLine::where('chart_of_account_id', $outputTaxAccount->id)
            ->whereHas('journalEntry', function ($q) use ($start, $end) {
                $q->whereBetween('date', [$start, $end]);
            })
            ->with('journalEntry')
            ->get();

        // 3. Aggregate
        $totalInput = $inputTaxLines->sum('debit') - $inputTaxLines->sum('credit'); // Asset: Dr increases
        $totalOutput = $outputTaxLines->sum('credit') - $outputTaxLines->sum('debit'); // Liability: Cr increases

        $netTaxPayable = $totalOutput - $totalInput;

        return [
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'summary' => [
                'input_tax' => $totalInput,
                'output_tax' => $totalOutput,
                'net_payable' => $netTaxPayable,
            ],
            'input_lines' => $inputTaxLines,
            'output_lines' => $outputTaxLines,
        ];
    }
}
