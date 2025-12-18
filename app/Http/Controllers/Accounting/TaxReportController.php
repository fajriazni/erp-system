<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Finance\Queries\GetTaxReportQuery;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxReportController extends Controller
{
    public function __construct(
        protected GetTaxReportQuery $query
    ) {}

    public function __invoke(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $report = $this->query->execute($startDate, $endDate);

        return Inertia::render('Accounting/Reports/TaxReport', [
            'report' => $report,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
