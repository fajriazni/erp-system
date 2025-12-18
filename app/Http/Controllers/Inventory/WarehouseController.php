<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Warehouses/Index', [
            'warehouses' => Warehouse::all(),
        ]);
    }
}
