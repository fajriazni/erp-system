<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\JournalEntryLine;
use Inertia\Inertia;

class GlController extends Controller
{
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
