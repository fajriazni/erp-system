<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function trialBalance(Request $request, \App\Domain\Finance\Queries\GetTrialBalanceQuery $query)
    {
        $date = $request->input('date', date('Y-m-d'));
        $data = $query->execute($date);

        return Inertia::render('Accounting/Reports/TrialBalance', [
            'data' => $data,
            'filters' => ['date' => $date],
        ]);
    }

    public function profitLoss(Request $request, \App\Domain\Finance\Queries\GetProfitLossQuery $query)
    {
        $startDate = $request->input('start_date', date('Y-m-01'));
        $endDate = $request->input('end_date', date('Y-m-t'));

        $data = $query->execute($startDate, $endDate);

        return Inertia::render('Accounting/Reports/ProfitLoss', [
            'data' => $data,
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate],
        ]);
    }

    public function balanceSheet(Request $request, \App\Domain\Finance\Queries\GetBalanceSheetQuery $query)
    {
        $date = $request->input('date', date('Y-m-d'));
        $data = $query->execute($date);

        return Inertia::render('Accounting/Reports/BalanceSheet', [
            'data' => $data,
            'filters' => ['date' => $date],
        ]);
    }
}
