<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\StrategyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StrategyController extends Controller
{
    public function __construct(
        protected StrategyService $service
    ) {}

    public function index()
    {
        return Inertia::render('Purchasing/Dashboard', [
            'kpis' => $this->service->getPerformanceKpis(),
            'currency' => \App\Models\Company::default()->currency,
        ]);
    }

    public function spend()
    {
        return Inertia::render('Purchasing/Analytics/Spend', [
            'data' => $this->service->getSpendAnalysis(),
            'currency' => \App\Models\Company::default()->currency,
        ]);
    }

    public function compliance()
    {
        return Inertia::render('Purchasing/Analytics/Compliance', [
            'data' => $this->service->getContractCompliance(),
            'currency' => \App\Models\Company::default()->currency,
        ]);
    }

    public function prMonitor()
    {
        return Inertia::render('Purchasing/Analytics/PrMonitor', [
            'data' => $this->service->getPrMonitorStats(),
            'currency' => \App\Models\Company::default()->currency,
        ]);
    }
}
