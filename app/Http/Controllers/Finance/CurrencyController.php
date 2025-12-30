<?php

namespace App\Http\Controllers\Finance;

use App\Domain\Finance\Services\CurrencyService;
use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    public function index(Request $request)
    {
        $currencies = Currency::orderBy('is_active', 'desc')
            ->orderBy('code')
            ->get();

        // Get recent rates for display (e.g. against IDR)
        $latestRates = ExchangeRate::whereIn('from_currency', $currencies->pluck('code')->toArray())
             ->where('to_currency', 'IDR')
             ->orderBy('effective_date', 'desc')
             ->get()
             ->unique(fn($item) => $item->from_currency . $item->to_currency);

        return Inertia::render('Finance/Currency/Index', [
            'currencies' => $currencies,
            'latestRates' => $latestRates,
            'baseCurrency' => 'IDR' // Configurable later
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|size:3|unique:currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
        ]);

        $validated['code'] = strtoupper($validated['code']);

        Currency::create($validated);

        return redirect()->back()->with('success', 'Currency created.');
    }

    public function update(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'is_active' => 'boolean',
        ]);

        $currency->update($validated);

        return redirect()->back()->with('success', 'Currency updated.');
    }

    public function storeRate(Request $request)
    {
        $validated = $request->validate([
            'from_currency' => 'required|exists:currencies,code',
            'to_currency' => 'required|exists:currencies,code',
            'rate' => 'required|numeric|min:0.0000000001',
            'effective_date' => 'required|date',
        ]);

        if ($validated['from_currency'] === $validated['to_currency']) {
            return back()->withErrors(['from_currency' => 'Source and Target currency must be different.']);
        }

        ExchangeRate::updateOrCreate(
            [
                'from_currency' => $validated['from_currency'],
                'to_currency' => $validated['to_currency'],
                'effective_date' => $validated['effective_date']
            ],
            ['rate' => $validated['rate']]
        );

        return redirect()->back()->with('success', 'Exchange rate updated.');
    }
}
