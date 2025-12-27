<?php

use App\Domain\Finance\Services\PostStockMoveService;
use App\Models\ChartOfAccount;
use App\Models\Product;
use App\Models\StockMove;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(AccountingSeeder::class);
    $this->user = User::factory()->create();
    $this->warehouse = Warehouse::factory()->create();
    $this->product = Product::factory()->create([
        'cost' => 100, // Product cost $100
    ]);
});

test('goods receipt creates inventory journal entry', function () {
    $stockMove = StockMove::factory()->create([
        'warehouse_id' => $this->warehouse->id,
        'product_id' => $this->product->id,
        'type' => 'receipt',
        'quantity' => 10,
        'date' => now(),
    ]);

    $service = app(PostStockMoveService::class);
    $journalEntry = $service->execute($stockMove, $this->user);

    expect($journalEntry)->not->toBeNull()
        ->and($stockMove->fresh()->journal_entry_id)->toBe($journalEntry->id)
        ->and($stockMove->fresh()->posted_at)->not->toBeNull();

    // Verify journal entry lines
    $inventoryAccount = ChartOfAccount::where('code', '1400')->first();
    $clearingAccount = ChartOfAccount::where('code', '2110')->first();

    $debitLine = $journalEntry->lines->where('chart_of_account_id', $inventoryAccount->id)->first();
    $creditLine = $journalEntry->lines->where('chart_of_account_id', $clearingAccount->id)->first();

    expect($debitLine->debit)->toBe('1000.00') // 10 × $100
        ->and($creditLine->credit)->toBe('1000.00');
});

test('goods issue creates COGS journal entry', function () {
    $stockMove = StockMove::factory()->create([
        'warehouse_id' => $this->warehouse->id,
        'product_id' => $this->product->id,
        'type' => 'issue',
        'quantity' => 5,
        'date' => now(),
    ]);

    $service = app(PostStockMoveService::class);
    $journalEntry = $service->execute($stockMove, $this->user);

    // Verify accounts
    $cogsAccount = ChartOfAccount::where('code', '5100')->first();
    $inventoryAccount = ChartOfAccount::where('code', '1400')->first();

    $debitLine = $journalEntry->lines->where('chart_of_account_id', $cogsAccount->id)->first();
    $creditLine = $journalEntry->lines->where('chart_of_account_id', $inventoryAccount->id)->first();

    expect($debitLine->debit)->toBe('500.00') // 5 × $100
        ->and($creditLine->credit)->toBe('500.00');
});

test('scrap creates loss journal entry', function () {
    $stockMove = StockMove::factory()->create([
        'warehouse_id' => $this->warehouse->id,
        'product_id' => $this->product->id,
        'type' => 'scrap',
        'quantity' => 2,
        'date' => now(),
    ]);

    $service = app(PostStockMoveService::class);
    $journalEntry = $service->execute($stockMove, $this->user);

    // Verify accounts
    $lossAccount = ChartOfAccount::where('code', '6200')->first();
    $inventoryAccount = ChartOfAccount::where('code', '1400')->first();

    $debitLine = $journalEntry->lines->where('chart_of_account_id', $lossAccount->id)->first();
    $creditLine = $journalEntry->lines->where('chart_of_account_id', $inventoryAccount->id)->first();

    expect($debitLine->debit)->toBe('200.00') // 2 × $100
        ->and($creditLine->credit)->toBe('200.00');
});

test('transfer does not create journal entry', function () {
    $stockMove = StockMove::factory()->create([
        'warehouse_id' => $this->warehouse->id,
        'product_id' => $this->product->id,
        'type' => 'transfer',
        'quantity' => 3,
        'date' => now(),
    ]);

    $service = app(PostStockMoveService::class);
    $journalEntry = $service->execute($stockMove, $this->user);

    expect($journalEntry)->toBeNull()
        ->and($stockMove->fresh()->journal_entry_id)->toBeNull();
});

test('cannot post already posted stock move', function () {
    $stockMove = StockMove::factory()->create([
        'warehouse_id' => $this->warehouse->id,
        'product_id' => $this->product->id,
        'type' => 'receipt',
        'quantity' => 10,
        'date' => now(),
    ]);

    $service = app(PostStockMoveService::class);
    $service->execute($stockMove, $this->user);

    // Try to post again
    $service->execute($stockMove, $this->user);
})->throws(DomainException::class, 'already been posted');

test('logs error on posting failure', function () {
    // Create stock move with invalid account mapping (simulate missing account)
    ChartOfAccount::where('code', '5100')->delete(); // Delete COGS account

    $stockMove = StockMove::factory()->create([
        'warehouse_id' => $this->warehouse->id,
        'product_id' => $this->product->id,
        'type' => 'issue',
        'quantity' => 5,
    ]);

    $service = app(PostStockMoveService::class);

    try {
        $service->execute($stockMove, $this->user);
    } catch (\Exception $e) {
        // Expected to throw
    }

    expect($stockMove->fresh()->posting_error)->not->toBeNull()
        ->and($stockMove->fresh()->journal_entry_id)->toBeNull();
});
