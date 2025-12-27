<?php

namespace App\Http\Controllers\Accounting\Analytics;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RatioController extends Controller
{
    /**
     * Display financial ratios analysis
     */
    public function index(): Response
    {
        $ratios = $this->calculateFinancialRatios();
        $trends = $this->getHistoricalTrends();

        return Inertia::render('Accounting/Analytics/Ratios', [
            'ratios' => $ratios,
            'trends' => $trends,
        ]);
    }

    /**
     * Calculate all financial ratios
     */
    private function calculateFinancialRatios(): array
    {
        // Get account balances
        $currentAssets = $this->getAccountBalance('asset', 'current');
        $totalAssets = $this->getAccountBalance('asset');
        $currentLiabilities = $this->getAccountBalance('liability', 'current');
        $totalLiabilities = $this->getAccountBalance('liability');
        $equity = $this->getAccountBalance('equity');
        $revenue = $this->getAccountBalance('revenue');
        $expenses = $this->getAccountBalance('expense');
        $netIncome = $revenue - $expenses;

        // Calculate inventory and receivables (approximate)
        $inventory = $this->getAccountBalanceByName('Inventory');
        $quickAssets = $currentAssets - $inventory;

        return [
            'liquidity' => [
                'current_ratio' => [
                    'value' => $currentLiabilities > 0 ? round($currentAssets / $currentLiabilities, 2) : 0,
                    'description' => 'Current Assets / Current Liabilities',
                    'benchmark' => '> 1.5',
                    'status' => $currentAssets / max($currentLiabilities, 1) > 1.5 ? 'good' : 'warning',
                ],
                'quick_ratio' => [
                    'value' => $currentLiabilities > 0 ? round($quickAssets / $currentLiabilities, 2) : 0,
                    'description' => '(Current Assets - Inventory) / Current Liabilities',
                    'benchmark' => '> 1.0',
                    'status' => $quickAssets / max($currentLiabilities, 1) > 1.0 ? 'good' : 'warning',
                ],
            ],
            'leverage' => [
                'debt_to_equity' => [
                    'value' => $equity > 0 ? round($totalLiabilities / $equity, 2) : 0,
                    'description' => 'Total Liabilities / Total Equity',
                    'benchmark' => '< 2.0',
                    'status' => $totalLiabilities / max($equity, 1) < 2.0 ? 'good' : 'warning',
                ],
                'debt_to_assets' => [
                    'value' => $totalAssets > 0 ? round($totalLiabilities / $totalAssets, 2) : 0,
                    'description' => 'Total Liabilities / Total Assets',
                    'benchmark' => '< 0.6',
                    'status' => $totalLiabilities / max($totalAssets, 1) < 0.6 ? 'good' : 'warning',
                ],
            ],
            'profitability' => [
                'roe' => [
                    'value' => $equity > 0 ? round(($netIncome / $equity) * 100, 2) : 0,
                    'description' => '(Net Income / Equity) × 100%',
                    'benchmark' => '> 15%',
                    'status' => ($netIncome / max($equity, 1)) * 100 > 15 ? 'good' : 'warning',
                    'unit' => '%',
                ],
                'roa' => [
                    'value' => $totalAssets > 0 ? round(($netIncome / $totalAssets) * 100, 2) : 0,
                    'description' => '(Net Income / Total Assets) × 100%',
                    'benchmark' => '> 10%',
                    'status' => ($netIncome / max($totalAssets, 1)) * 100 > 10 ? 'good' : 'warning',
                    'unit' => '%',
                ],
                'profit_margin' => [
                    'value' => $revenue > 0 ? round(($netIncome / $revenue) * 100, 2) : 0,
                    'description' => '(Net Income / Revenue) × 100%',
                    'benchmark' => '> 10%',
                    'status' => ($netIncome / max($revenue, 1)) * 100 > 10 ? 'good' : 'warning',
                    'unit' => '%',
                ],
            ],
        ];
    }

    /**
     * Get account balance by type and subtype
     */
    private function getAccountBalance(string $type, ?string $subtype = null): float
    {
        $query = ChartOfAccount::where('type', $type)->where('is_active', true);

        if ($subtype) {
            $query->where('name', 'like', "%{$subtype}%");
        }

        $accounts = $query->pluck('id');

        if ($accounts->isEmpty()) {
            return 0;
        }

        $balance = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entry_lines.chart_of_account_id', $accounts)
            ->where('journal_entries.status', 'posted')
            ->sum(DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        // For liability, equity, and revenue accounts, reverse the sign
        if (in_array($type, ['liability', 'equity', 'revenue'])) {
            $balance = -$balance;
        }

        return $balance;
    }

    /**
     * Get account balance by account name
     */
    private function getAccountBalanceByName(string $name): float
    {
        $accounts = ChartOfAccount::where('name', 'like', "%{$name}%")
            ->where('is_active', true)
            ->pluck('id');

        if ($accounts->isEmpty()) {
            return 0;
        }

        $balance = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entry_lines.chart_of_account_id', $accounts)
            ->where('journal_entries.status', 'posted')
            ->sum(DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        return abs($balance);
    }

    /**
     * Get historical trends for ratios (last 6 months)
     */
    private function getHistoricalTrends(): array
    {
        $trends = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');

            // Note: This is a simplified version.
            // In production, you'd want to calculate balances as of each month end
            $trends[] = [
                'month' => $monthKey,
                'label' => $date->format('M Y'),
                // Placeholder values - would need historical balance calculation
                'current_ratio' => rand(100, 200) / 100,
                'debt_to_equity' => rand(50, 150) / 100,
                'roe' => rand(10, 25),
            ];
        }

        return $trends;
    }
}
