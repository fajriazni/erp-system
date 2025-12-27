<?php

namespace App\Http\Controllers\Accounting\Analytics;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PLAnalyticsController extends Controller
{
    /**
     * Display P&L analytics with trends and breakdowns
     */
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->startOfYear()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $plStatement = $this->getPLStatement($startDate, $endDate);
        $revenueBreakdown = $this->getRevenueBreakdown($startDate, $endDate);
        $expenseBreakdown = $this->getExpenseBreakdown($startDate, $endDate);
        $monthlyTrends = $this->getMonthlyTrends($startDate, $endDate);
        $comparison = $this->getPeriodComparison($startDate, $endDate);

        return Inertia::render('Accounting/Analytics/PL', [
            'plStatement' => $plStatement,
            'revenueBreakdown' => $revenueBreakdown,
            'expenseBreakdown' => $expenseBreakdown,
            'monthlyTrends' => $monthlyTrends,
            'comparison' => $comparison,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Get P&L statement for the period
     */
    private function getPLStatement(string $startDate, string $endDate): array
    {
        $revenue = $this->getAccountTypeTotal('revenue', $startDate, $endDate);
        $expenses = $this->getAccountTypeTotal('expense', $startDate, $endDate);
        $grossProfit = $revenue;
        $operatingIncome = $revenue - $expenses;
        $netIncome = $operatingIncome;

        // Calculate margins
        $grossMargin = $revenue > 0 ? round(($grossProfit / $revenue) * 100, 2) : 0;
        $operatingMargin = $revenue > 0 ? round(($operatingIncome / $revenue) * 100, 2) : 0;
        $netMargin = $revenue > 0 ? round(($netIncome / $revenue) * 100, 2) : 0;

        return [
            'revenue' => round($revenue, 2),
            'cost_of_goods_sold' => 0, // Would be calculated from COGS accounts
            'gross_profit' => round($grossProfit, 2),
            'gross_margin' => $grossMargin,
            'operating_expenses' => round($expenses, 2),
            'operating_income' => round($operatingIncome, 2),
            'operating_margin' => $operatingMargin,
            'other_income' => 0, // Could be added later
            'other_expenses' => 0, // Could be added later
            'net_income' => round($netIncome, 2),
            'net_margin' => $netMargin,
        ];
    }

    /**
     * Get revenue breakdown by account
     */
    private function getRevenueBreakdown(string $startDate, string $endDate): array
    {
        $revenueAccounts = ChartOfAccount::where('type', 'revenue')
            ->where('is_active', true)
            ->get();

        $breakdown = [];
        $totalRevenue = 0;

        foreach ($revenueAccounts as $account) {
            $amount = $this->getAccountTotal($account->id, $startDate, $endDate, 'revenue');
            if ($amount > 0) {
                $breakdown[] = [
                    'account_id' => $account->id,
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'amount' => round($amount, 2),
                ];
                $totalRevenue += $amount;
            }
        }

        // Calculate percentages
        foreach ($breakdown as &$item) {
            $item['percentage'] = $totalRevenue > 0
                ? round(($item['amount'] / $totalRevenue) * 100, 2)
                : 0;
        }

        // Sort by amount descending
        usort($breakdown, function ($a, $b) {
            return $b['amount'] <=> $a['amount'];
        });

        return $breakdown;
    }

    /**
     * Get expense breakdown by account
     */
    private function getExpenseBreakdown(string $startDate, string $endDate): array
    {
        $expenseAccounts = ChartOfAccount::where('type', 'expense')
            ->where('is_active', true)
            ->get();

        $breakdown = [];
        $totalExpenses = 0;

        foreach ($expenseAccounts as $account) {
            $amount = $this->getAccountTotal($account->id, $startDate, $endDate, 'expense');
            if ($amount > 0) {
                $breakdown[] = [
                    'account_id' => $account->id,
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'amount' => round($amount, 2),
                ];
                $totalExpenses += $amount;
            }
        }

        // Calculate percentages
        foreach ($breakdown as &$item) {
            $item['percentage'] = $totalExpenses > 0
                ? round(($item['amount'] / $totalExpenses) * 100, 2)
                : 0;
        }

        // Sort by amount descending
        usort($breakdown, function ($a, $b) {
            return $b['amount'] <=> $a['amount'];
        });

        return $breakdown;
    }

    /**
     * Get monthly trends for revenue and expenses
     */
    private function getMonthlyTrends(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $trends = [];

        $current = $start->copy()->startOfMonth();
        while ($current->lte($end)) {
            $monthStart = $current->copy()->startOfMonth();
            $monthEnd = $current->copy()->endOfMonth();

            $revenue = $this->getAccountTypeTotal('revenue', $monthStart->format('Y-m-d'), $monthEnd->format('Y-m-d'));
            $expenses = $this->getAccountTypeTotal('expense', $monthStart->format('Y-m-d'), $monthEnd->format('Y-m-d'));

            $trends[] = [
                'month' => $current->format('Y-m'),
                'label' => $current->format('M Y'),
                'revenue' => round($revenue, 2),
                'expenses' => round($expenses, 2),
                'net_income' => round($revenue - $expenses, 2),
            ];

            $current->addMonth();
        }

        return $trends;
    }

    /**
     * Get period comparison (current vs previous period)
     */
    private function getPeriodComparison(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $days = $start->diffInDays($end);

        // Calculate same period length for previous period
        $prevEnd = $start->copy()->subDay();
        $prevStart = $prevEnd->copy()->subDays($days);

        $currentRevenue = $this->getAccountTypeTotal('revenue', $startDate, $endDate);
        $currentExpenses = $this->getAccountTypeTotal('expense', $startDate, $endDate);
        $currentNetIncome = $currentRevenue - $currentExpenses;

        $prevRevenue = $this->getAccountTypeTotal('revenue', $prevStart->format('Y-m-d'), $prevEnd->format('Y-m-d'));
        $prevExpenses = $this->getAccountTypeTotal('expense', $prevStart->format('Y-m-d'), $prevEnd->format('Y-m-d'));
        $prevNetIncome = $prevRevenue - $prevExpenses;

        return [
            'current' => [
                'revenue' => round($currentRevenue, 2),
                'expenses' => round($currentExpenses, 2),
                'net_income' => round($currentNetIncome, 2),
            ],
            'previous' => [
                'revenue' => round($prevRevenue, 2),
                'expenses' => round($prevExpenses, 2),
                'net_income' => round($prevNetIncome, 2),
            ],
            'variance' => [
                'revenue' => round($currentRevenue - $prevRevenue, 2),
                'revenue_pct' => $prevRevenue > 0 ? round((($currentRevenue - $prevRevenue) / $prevRevenue) * 100, 2) : 0,
                'expenses' => round($currentExpenses - $prevExpenses, 2),
                'expenses_pct' => $prevExpenses > 0 ? round((($currentExpenses - $prevExpenses) / $prevExpenses) * 100, 2) : 0,
                'net_income' => round($currentNetIncome - $prevNetIncome, 2),
                'net_income_pct' => $prevNetIncome != 0 ? round((($currentNetIncome - $prevNetIncome) / abs($prevNetIncome)) * 100, 2) : 0,
            ],
        ];
    }

    /**
     * Get total for account type in date range
     */
    private function getAccountTypeTotal(string $type, string $startDate, string $endDate): float
    {
        $accounts = ChartOfAccount::where('type', $type)
            ->where('is_active', true)
            ->pluck('id');

        if ($accounts->isEmpty()) {
            return 0;
        }

        $total = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entry_lines.chart_of_account_id', $accounts)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->sum(DB::raw('journal_entry_lines.'.($type === 'revenue' ? 'credit - journal_entry_lines.debit' : 'debit - journal_entry_lines.credit')));

        return abs($total);
    }

    /**
     * Get total for specific account in date range
     */
    private function getAccountTotal(int $accountId, string $startDate, string $endDate, string $accountType): float
    {
        $total = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.chart_of_account_id', $accountId)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->sum(DB::raw('journal_entry_lines.'.($accountType === 'revenue' ? 'credit - journal_entry_lines.debit' : 'debit - journal_entry_lines.credit')));

        return abs($total);
    }
}
