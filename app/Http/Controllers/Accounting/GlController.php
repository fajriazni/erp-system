<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlController extends Controller
{
    /**
     * Account Hierarchy / Chart of Accounts View.
     */
    public function hierarchy()
    {
        return Inertia::render('Accounting/GL/Hierarchy', [
            'accounts' => ChartOfAccount::orderBy('code')->get()->toTree(),
        ]);
    }

    /**
     * Audit Trail (All Journal Lines).
     */
    public function audit()
    {
        return Inertia::render('Accounting/GL/Audit', [
            'lines' => JournalEntryLine::with(['journalEntry', 'chartOfAccount'])
                ->latest()
                ->paginate(50),
        ]);
    }

    /**
     * Journal Templates (Placeholder).
     */
    public function templates()
    {
        return Inertia::render('Accounting/GL/Templates', [
             'templates' => [],
        ]);
    }
}
