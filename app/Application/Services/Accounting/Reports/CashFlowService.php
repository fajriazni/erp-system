<?php

namespace App\Application\Services\Accounting\Reports;

use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;

class CashFlowService
{
    /**
     * Get Cash Flow Statement using Indirect Method
     */
    public function getCashFlow(string $startDate, string $endDate): array
    {
        // Get net income from P&L service
        $plService = new ProfitLossService;
        $pl = $plService->getProfitLoss($startDate, $endDate);
        $netIncome = $pl['net_income'];

        // Operating Activities (simplified indirect method)
        $operatingActivities = $this->getOperatingActivities($startDate, $endDate, $netIncome);

        // Investing Activities
        $investingActivities = $this->getInvestingActivities($startDate, $endDate);

        // Financing Activities
        $financingActivities = $this->getFinancingActivities($startDate, $endDate);

        $netCashFlow = $operatingActivities['total'] + $investingActivities['total'] + $financingActivities['total'];

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'operating_activities' => $operatingActivities,
            'investing_activities' => $investingActivities,
            'financing_activities' => $financingActivities,
            'net_cash_flow' => $netCashFlow,
        ];
    }

    /**
     * Operating activities (indirect method)
     */
    private function getOperatingActivities(string $startDate, string $endDate, float $netIncome): array
    {
        // Simplified: Net Income + adjustments
        // In real scenario, add depreciation, changes in working capital, etc.

        return [
            'net_income' => $netIncome,
            'adjustments' => [],
            'total' => $netIncome, // Simplified
        ];
    }

    /**
     * Investing activities
     */
    private function getInvestingActivities(string $startDate, string $endDate): array
    {
        // Get fixed asset purchases/sales (account codes 12xx)
        $assetAccounts = ChartOfAccount::where('code', 'like', '12%')
            ->where('is_active', true)
            ->get();

        $items = [];
        $total = 0;

        foreach ($assetAccounts as $account) {
            $amount = $this->getAccountChange($account->id, $startDate, $endDate);
            if (abs($amount) >= 0.01) {
                $items[] = [
                    'description' => $account->name,
                    'amount' => -$amount, // Negative = cash outflow for asset purchase
                ];
                $total -= $amount;
            }
        }

        return [
            'items' => $items,
            'total' => $total,
        ];
    }

    /**
     * Financing activities
     */
    private function getFinancingActivities(string $startDate, string $endDate): array
    {
        // Get loans and equity changes (account codes 22xx and 31xx)
        $financingAccounts = ChartOfAccount::where(function ($q) {
            $q->where('code', 'like', '22%') // Long-term liabilities
                ->orWhere('code', 'like', '31%'); // Share capital
        })->where('is_active', true)->get();

        $items = [];
        $total = 0;

        foreach ($financingAccounts as $account) {
            $amount = $this->getAccountChange($account->id, $startDate, $endDate);
            if (abs($amount) >= 0.01) {
                $items[] = [
                    'description' => $account->name,
                    'amount' => $amount, // Positive = cash inflow
                ];
                $total += $amount;
            }
        }

        return [
            'items' => $items,
            'total' => $total,
        ];
    }

    /**
     * Get account change between dates
     */
    private function getAccountChange(int $accountId, string $startDate, string $endDate): float
    {
        $account = ChartOfAccount::find($accountId);
        if (! $account) {
            return 0;
        }

        $lines = JournalEntryLine::where('chart_of_account_id', $accountId)
            ->whereHas('journalEntry', function ($q) use ($startDate, $endDate) {
                $q->where('status', 'posted')
                    ->whereBetween('date', [$startDate, $endDate]);
            })
            ->get();

        $debit = $lines->sum('debit');
        $credit = $lines->sum('credit');

        // Return net change
        if (in_array($account->type, ['asset', 'expense'])) {
            return $debit - $credit;
        } else {
            return $credit - $debit;
        }
    }
}
