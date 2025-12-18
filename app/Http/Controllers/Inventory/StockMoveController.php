<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\StockMove;
use Inertia\Inertia;

class StockMoveController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Operations/Moves', [
            'moves' => StockMove::with(['product', 'warehouse', 'reference'])
                ->latest()
                ->paginate(20),
        ]);
    }
}
