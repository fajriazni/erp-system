<?php

namespace App\Application\Services\Accounting\Reports;

use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;

class ProfitLossService
{
    /**
     * Get Profit & Loss statement for a date range
     */
    public function getProfitLoss(?string $startDate = null, ?string $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $endDate ?? now()->format('Y-m-d');

        // Get accounts for each P&L category
        $revenue = $this->getAccountsInRange(['revenue'], $startDate, $endDate);
        $cogs = $this->getAccountsInRange(['cost_of_sales'], $startDate, $endDate);
        $operatingExpenses = $this->getAccountsInRange(['expense'], $startDate, $endDate);

        // Calculate totals
        $totalRevenue = collect($revenue)->sum('amount');
        $totalCogs = collect($cogs)->sum('amount');
        $totalOperatingExpenses = collect($operatingExpenses)->sum('amount');

        $grossProfit = $totalRevenue - $totalCogs;
        $operatingIncome = $grossProfit - $totalOperatingExpenses;
        $netIncome = $operatingIncome; // Simplified, can add other income/expenses

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'revenue' => [
                'items' => $revenue,
                'total' => $totalRevenue,
            ],
            'cost_of_sales' => [
                'items' => $cogs,
                'total' => $totalCogs,
            ],
            'gross_profit' => $grossProfit,
            'gross_margin' => $totalRevenue > 0 ? ($grossProfit / $totalRevenue) * 100 : 0,
            'operating_expenses' => [
                'items' => $operatingExpenses,
                'total' => $totalOperatingExpenses,
            ],
            'operating_income' => $operatingIncome,
            'net_income' => $netIncome,
            'net_margin' => $totalRevenue > 0 ? ($netIncome / $totalRevenue) * 100 : 0,
        ];
    }

    /**
     * Get comparative P&L
     */
    public function getComparativePL(array $periods): array
    {
        $results = [];

        foreach ($periods as $period) {
            $results[] = $this->getProfitLoss($period['start_date'], $period['end_date']);
        }

        return [
            'periods' => $results,
            'is_comparative' => count($results) > 1,
        ];
    }

    /**
     * Get accounts in date range with totals
     */
    private function getAccountsInRange(array $types, string $startDate, string $endDate): array
    {
        $accounts = ChartOfAccount::whereIn('type', $types)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return $accounts->map(function ($account) use ($startDate, $endDate) {
            $amount = $this->calculateAccountTotal($account, $startDate, $endDate);

            return [
                'account_id' => $account->id,
                'account_code' => $account->code,
                'account_name' => $account->name,
                'account_type' => $account->type,
                'amount' => abs($amount), // Always show as positive
            ];
        })->filter(fn ($account) => abs($account['amount']) >= 0.01)->values()->toArray();
    }

    /**
     * Calculate account total for date range
     */
    private function calculateAccountTotal(ChartOfAccount $account, string $startDate, string $endDate): float
    {
        $lines = JournalEntryLine::where('chart_of_account_id', $account->id)
            ->whereHas('journalEntry', function ($q) use ($startDate, $endDate) {
                $q->where('status', 'posted')
                    ->whereBetween('date', [$startDate, $endDate]);
            })
            ->get();

        $debit = $lines->sum('debit');
        $credit = $lines->sum('credit');

        // For revenue/COGS/expenses, return credit - debit (revenue) or debit - credit (expenses/COGS)
        if ($account->type === 'revenue') {
            return $credit - $debit;
        } else {
            return $debit - $credit;
        }
    }
}
