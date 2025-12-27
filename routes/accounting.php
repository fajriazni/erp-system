<?php

use App\Http\Controllers\Accounting\ChartOfAccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Accounting Routes
|--------------------------------------------------------------------------
|
| Routes for the Accounting module including Chart of Accounts,
| Journal Entries, and Financial Reports.
|
*/

// Chart of Accounts
Route::resource('coa', ChartOfAccountController::class)->names([
    'index' => 'accounting.coa.index',
    'create' => 'accounting.coa.create',
    'store' => 'accounting.coa.store',
    'show' => 'accounting.coa.show',
    'edit' => 'accounting.coa.edit',
    'update' => 'accounting.coa.update',
    'destroy' => 'accounting.coa.destroy',
]);

// Account Hierarchy Viewer
Route::get('hierarchy', [ChartOfAccountController::class, 'hierarchy'])
    ->name('accounting.hierarchy');
