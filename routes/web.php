<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Purchasing\PurchaseOrderController;
use App\Http\Controllers\Purchasing\GoodsReceiptController;
use App\Http\Controllers\Purchasing\VendorBillController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/inventory', function () {
        return Inertia::render('Inventory/Dashboard');
    })->name('inventory.dashboard');

    Route::get('/sales', function () {
        return Inertia::render('Sales/Dashboard');
    })->name('sales.dashboard');

    Route::prefix('purchasing')->name('purchasing.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Purchasing/Dashboard');
        })->name('dashboard');

        Route::resource('orders', PurchaseOrderController::class);

        // Status action routes
        Route::post('orders/{order}/submit', [PurchaseOrderController::class, 'submit'])->name('orders.submit');
        Route::post('orders/{order}/approve', [PurchaseOrderController::class, 'approve'])->name('orders.approve');
        Route::post('orders/{order}/cancel', [PurchaseOrderController::class, 'cancel'])->name('orders.cancel');

        // Purchase Requests
        // Purchase Requests
        Route::post('requests/{request}/submit', [\App\Http\Controllers\Purchasing\PurchaseRequestController::class, 'submit'])
            ->name('requests.submit');
        Route::post('requests/{request}/convert', [\App\Http\Controllers\Purchasing\PurchaseRequestController::class, 'convertToPO'])
            ->name('requests.convert');
        Route::resource('requests', \App\Http\Controllers\Purchasing\PurchaseRequestController::class);

        Route::resource('vendors', \App\Http\Controllers\Purchasing\VendorController::class);

        Route::resource('receipts', GoodsReceiptController::class);
        Route::post('receipts/{receipt}/post', [GoodsReceiptController::class, 'post'])->name('receipts.post');

        Route::resource('bills', VendorBillController::class);
        Route::post('bills/{bill}/post', [VendorBillController::class, 'post'])->name('bills.post');
    });

    Route::get('/accounting', function () {
        return Inertia::render('Accounting/Dashboard');
    })->name('accounting.dashboard');

    Route::get('/hrm', function () {
        return Inertia::render('HRM/Dashboard');
    })->name('hrm.dashboard');

    Route::get('/mrp', function () {
        return Inertia::render('Mrp/Dashboard');
    })->name('mrp.dashboard');

    Route::get('/projects', function () {
        return Inertia::render('Projects/Dashboard');
    })->name('projects.dashboard');

    Route::get('/assets', function () {
        return Inertia::render('Assets/Dashboard');
    })->name('assets.dashboard');

    Route::get('/pos', function () {
        return Inertia::render('Pos/Dashboard');
    })->name('pos.dashboard');

    Route::get('/fleet', function () {
        return Inertia::render('Fleet/Dashboard');
    })->name('fleet.dashboard');

    Route::get('/helpdesk', function () {
        return Inertia::render('Helpdesk/Dashboard');
    })->name('helpdesk.dashboard');
});

// Workflow API Routes
Route::prefix('api')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/my-approvals', [App\Http\Controllers\Api\ApprovalTaskController::class, 'myApprovals']);
    Route::post('/approval-tasks/{task}/approve', [App\Http\Controllers\Api\ApprovalTaskController::class, 'approve']);
    Route::post('/approval-tasks/{task}/reject', [App\Http\Controllers\Api\ApprovalTaskController::class, 'reject']);
    Route::post('/approval-tasks/{task}/delegate', [App\Http\Controllers\Api\ApprovalTaskController::class, 'delegate']);
    Route::get('/approval-tasks/users', [App\Http\Controllers\Api\ApprovalTaskController::class, 'users']);

    Route::get('/workflows', [App\Http\Controllers\Api\WorkflowController::class, 'index']);
    Route::post('/workflows/start', [App\Http\Controllers\Api\WorkflowController::class, 'start']);
    Route::get('/workflow-instances/{instance}', [App\Http\Controllers\Api\WorkflowController::class, 'show']);
    Route::post('/workflow-instances/{instance}/cancel', [App\Http\Controllers\Api\WorkflowController::class, 'cancel']);
});

// Workflow Management Pages
Route::middleware(['auth'])->prefix('workflows')->group(function () {
    Route::get('/management', [App\Http\Controllers\WorkflowManagementController::class, 'index'])->name('workflows.management');
    Route::get('/instances', [App\Http\Controllers\WorkflowInstanceController::class, 'index'])->name('workflows.instances');
    Route::post('/instances/bulk', [App\Http\Controllers\WorkflowInstanceController::class, 'bulkAction'])->name('workflows.instances.bulk');
    Route::get('/instances/{instance}', [App\Http\Controllers\WorkflowInstanceController::class, 'show'])->name('workflows.instances.show');
    Route::post('/instances/{instance}/cancel', [App\Http\Controllers\WorkflowInstanceController::class, 'cancel'])->name('workflows.instances.cancel');
    Route::get('/my-approvals', [App\Http\Controllers\WorkflowManagementController::class, 'myApprovals'])->name('workflows.my-approvals');


    // Workflow CRUD
    Route::get('/create', [App\Http\Controllers\WorkflowController::class, 'create'])->name('workflows.create');
    Route::post('/', [App\Http\Controllers\WorkflowController::class, 'store'])->name('workflows.store');
    Route::get('/{workflow}/edit', [App\Http\Controllers\WorkflowController::class, 'edit'])->name('workflows.edit');
    Route::put('/{workflow}', [App\Http\Controllers\WorkflowController::class, 'update'])->name('workflows.update');
    Route::delete('/{workflow}', [App\Http\Controllers\WorkflowController::class, 'destroy'])->name('workflows.destroy');
});

require __DIR__.'/settings.php';
