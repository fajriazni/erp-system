<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the accounting dashboard with financial intelligence
     */
    public function index(): Response
    {
        $metrics = $this->getFinancialHealthMetrics();
        $recentTransactions = $this->getRecentTransactions();
        $alerts = $this->getAlerts();
        $periodComparison = $this->getPeriodComparison();

        return Inertia::render('Accounting/Dashboard', [
            'metrics' => $metrics,
            'recentTransactions' => $recentTransactions,
            'alerts' => $alerts,
            'periodComparison' => $periodComparison,
        ]);
    }

    /**
     * Get financial health metrics
     */
    private function getFinancialHealthMetrics(): array
    {
        // Get account balances by type
        $assets = $this->getAccountTypeBalance('asset');
        $liabilities = $this->getAccountTypeBalance('liability');
        $equity = $this->getAccountTypeBalance('equity');
        $revenue = $this->getAccountTypeBalance('revenue');
        $expenses = $this->getAccountTypeBalance('expense');

        // Calculate key metrics
        $netIncome = $revenue - $expenses;
        $totalEquity = $equity + $netIncome;

        return [
            'total_assets' => $assets,
            'total_liabilities' => $liabilities,
            'total_equity' => $totalEquity,
            'revenue' => $revenue,
            'expenses' => $expenses,
            'net_income' => $netIncome,
            'current_ratio' => $liabilities > 0 ? round($assets / $liabilities, 2) : 0,
        ];
    }

    /**
     * Get balance for a specific account type
     */
    private function getAccountTypeBalance(string $type): float
    {
        $accounts = ChartOfAccount::where('type', $type)
            ->where('is_active', true)
            ->pluck('id');

        if ($accounts->isEmpty()) {
            return 0;
        }

        // Calculate balance from journal entry lines
        $balance = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entry_lines.chart_of_account_id', $accounts)
            ->where('journal_entries.status', 'posted')
            ->sum(DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        // For liability, equity, and revenue accounts, reverse the sign
        if (in_array($type, ['liability', 'equity', 'revenue'])) {
            $balance = -$balance;
        }

        return round($balance, 2);
    }

    /**
     * Get recent transactions
     */
    private function getRecentTransactions(): array
    {
        return JournalEntry::with('lines.account')
            ->latest('date')
            ->limit(10)
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'reference_number' => $entry->reference_number,
                    'date' => $entry->date?->format('Y-m-d'),
                    'description' => $entry->description,
                    'status' => $entry->status,
                    'total_debit' => $entry->lines->sum('debit'),
                    'total_credit' => $entry->lines->sum('credit'),
                ];
            })
            ->toArray();
    }

    /**
     * Get alerts for dashboard
     */
    private function getAlerts(): array
    {
        $alerts = [];

        // Check for unbalanced entries
        $unbalancedCount = JournalEntry::where('status', 'draft')
            ->get()
            ->filter(function ($entry) {
                $debitSum = $entry->lines->sum('debit');
                $creditSum = $entry->lines->sum('credit');

                return abs($debitSum - $creditSum) > 0.01;
            })
            ->count();

        if ($unbalancedCount > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Unbalanced Journal Entries',
                'message' => "{$unbalancedCount} draft journal entries are not balanced",
                'action_url' => '/accounting/journal-entries?status=draft',
            ];
        }

        // Check for draft entries
        $draftCount = JournalEntry::where('status', 'draft')->count();
        if ($draftCount > 10) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Pending Journal Entries',
                'message' => "{$draftCount} journal entries are waiting to be posted",
                'action_url' => '/accounting/journal-entries?status=draft',
            ];
        }

        return $alerts;
    }

    /**
     * Get period comparison data
     */
    private function getPeriodComparison(): array
    {
        $currentMonth = now()->startOfMonth();
        $previousMonth = now()->subMonth()->startOfMonth();

        return [
            'current_period' => [
                'revenue' => $this->getRevenueForPeriod($currentMonth, now()),
                'expenses' => $this->getExpensesForPeriod($currentMonth, now()),
            ],
            'previous_period' => [
                'revenue' => $this->getRevenueForPeriod($previousMonth, $previousMonth->copy()->endOfMonth()),
                'expenses' => $this->getExpensesForPeriod($previousMonth, $previousMonth->copy()->endOfMonth()),
            ],
        ];
    }

    /**
     * Get revenue for a specific period
     */
    private function getRevenueForPeriod($startDate, $endDate): float
    {
        $revenueAccounts = ChartOfAccount::where('type', 'revenue')
            ->where('is_active', true)
            ->pluck('id');

        if ($revenueAccounts->isEmpty()) {
            return 0;
        }

        $revenue = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entry_lines.chart_of_account_id', $revenueAccounts)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->sum(DB::raw('journal_entry_lines.credit - journal_entry_lines.debit'));

        return round($revenue, 2);
    }

    /**
     * Get expenses for a specific period
     */
    private function getExpensesForPeriod($startDate, $endDate): float
    {
        $expenseAccounts = ChartOfAccount::where('type', 'expense')
            ->where('is_active', true)
            ->pluck('id');

        if ($expenseAccounts->isEmpty()) {
            return 0;
        }

        $expenses = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entry_lines.chart_of_account_id', $expenseAccounts)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->sum(DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        return round($expenses, 2);
    }
}
