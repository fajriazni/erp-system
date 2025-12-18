<?php

namespace App\Domain\Finance\Queries;

use App\Models\ChartOfAccount;
use Illuminate\Database\Eloquent\Builder;

class GetProfitLossQuery
{
    /**
     * Get Profit and Loss statement for a period.
     *
     * @param  string  $startDate  YYYY-MM-DD
     * @param  string  $endDate  YYYY-MM-DD
     * @return array Structure with Income, Expense, and Net Income
     */
    public function execute(string $startDate, string $endDate)
    {
        // Wrapper for code reuse
        $getAccounts = function (array $types) use ($startDate, $endDate) {
            return ChartOfAccount::whereIn('type', $types)
                ->withSum(['journalEntryLines as total_debit' => function (Builder $query) use ($startDate, $endDate) {
                    $query->whereHas('journalEntry', function (Builder $q) use ($startDate, $endDate) {
                        $q->where('status', 'posted')
                            ->whereBetween('date', [$startDate, $endDate]);
                    });
                }], 'debit')
                ->withSum(['journalEntryLines as total_credit' => function (Builder $query) use ($startDate, $endDate) {
                    $query->whereHas('journalEntry', function (Builder $q) use ($startDate, $endDate) {
                        $q->where('status', 'posted')
                            ->whereBetween('date', [$startDate, $endDate]);
                    });
                }], 'credit')
                ->orderBy('code')
                ->get()
                ->map(function ($account) use ($types) {
                    $debit = (float) $account->total_debit;
                    $credit = (float) $account->total_credit;

                    // REVENUE: Credit - Debit
                    // EXPENSE: Debit - Credit
                    $balance = 0;
                    if (in_array('REVENUE', $types)) {
                        $balance = $credit - $debit;
                    } else {
                        $balance = $debit - $credit;
                    }

                    return [
                        'id' => $account->id,
                        'code' => $account->code,
                        'name' => $account->name,
                        'amount' => $balance,
                    ];
                })
                ->filter(fn ($a) => $a['amount'] != 0) // Only showing active accounts
                ->values();
        };

        $income = $getAccounts(['REVENUE']);
        $expense = $getAccounts(['EXPENSE']);

        $totalIncome = $income->sum('amount');
        $totalExpense = $expense->sum('amount');

        return [
            'income' => $income,
            'total_income' => $totalIncome,
            'expense' => $expense,
            'total_expense' => $totalExpense,
            'net_income' => $totalIncome - $totalExpense,
        ];
    }
}
