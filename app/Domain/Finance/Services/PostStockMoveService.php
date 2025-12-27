<?php

namespace App\Domain\Finance\Services;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\StockMove;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PostStockMoveService
{
    public function __construct(
        private CreateJournalEntryService $createJournalEntryService
    ) {}

    /**
     * Post a stock move to accounting (create journal entry)
     */
    public function execute(StockMove $stockMove, User $user): ?JournalEntry
    {
        // Skip if already posted
        if ($stockMove->journal_entry_id) {
            throw new DomainException('Stock move has already been posted to accounting');
        }

        // Skip if transfer (no accounting impact)
        if ($stockMove->type === 'transfer') {
            return null;
        }

        try {
            return DB::transaction(function () use ($stockMove, $user) {
                // Determine accounts and calculate amount
                $accounts = $this->determineAccounts($stockMove);
                $amount = $this->calculateAmount($stockMove);

                if ($amount <= 0) {
                    throw new DomainException('Cannot post stock move with zero or negative value');
                }

                // Create journal entry
                $lines = [
                    [
                        'chart_of_account_id' => $accounts['debit'],
                        'debit' => $amount,
                        'credit' => 0,
                    ],
                    [
                        'chart_of_account_id' => $accounts['credit'],
                        'debit' => 0,
                        'credit' => $amount,
                    ],
                ];

                $journalEntry = $this->createJournalEntryService->execute(
                    date: $stockMove->date->format('Y-m-d'),
                    referenceNumber: $this->generateReference($stockMove),
                    description: $this->generateDescription($stockMove),
                    lines: $lines,
                    user: $user
                );

                // Link journal entry to stock move
                $stockMove->update([
                    'journal_entry_id' => $journalEntry->id,
                    'posted_at' => now(),
                    'posting_error' => null,
                ]);

                return $journalEntry;
            });
        } catch (\Exception $e) {
            // Log error to stock move
            $stockMove->update([
                'posting_error' => $e->getMessage(),
            ]);

            Log::error('Failed to post stock move to accounting', [
                'stock_move_id' => $stockMove->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Determine debit and credit accounts based on stock move type
     */
    private function determineAccounts(StockMove $stockMove): array
    {
        return match ($stockMove->type) {
            'receipt' => [
                'debit' => $this->getAccountId('1400'), // Inventory
                'credit' => $this->getAccountId('2110'), // GR/IR Clearing
            ],
            'issue' => [
                'debit' => $this->getAccountId('5100'), // COGS
                'credit' => $this->getAccountId('1400'), // Inventory
            ],
            'scrap', 'adjustment' => [
                'debit' => $this->getAccountId('6200'), // Loss on Disposal
                'credit' => $this->getAccountId('1400'), // Inventory
            ],
            default => throw new DomainException("Unknown stock move type: {$stockMove->type}"),
        };
    }

    /**
     * Calculate amount for journal entry (qty × product cost)
     */
    private function calculateAmount(StockMove $stockMove): float
    {
        $product = $stockMove->product;

        if (! $product) {
            throw new DomainException('Stock move must have a product');
        }

        return abs($stockMove->quantity) * ($product->cost ?? 0);
    }

    /**
     * Get account ID by code
     */
    private function getAccountId(string $code): int
    {
        $account = ChartOfAccount::where('code', $code)->first();

        if (! $account) {
            throw new DomainException("Account code {$code} not found in Chart of Accounts");
        }

        return $account->id;
    }

    /**
     * Generate journal entry reference number
     */
    private function generateReference(StockMove $stockMove): string
    {
        $prefix = match ($stockMove->type) {
            'receipt' => 'GR',
            'issue' => 'GI',
            'scrap' => 'SCRAP',
            'adjustment' => 'ADJ',
            default => 'SM',
        };

        return "{$prefix}-{$stockMove->id}-".$stockMove->date->format('Ymd');
    }

    /**
     * Generate journal entry description
     */
    private function generateDescription(StockMove $stockMove): string
    {
        $product = $stockMove->product;
        $warehouse = $stockMove->warehouse;

        $type = ucfirst($stockMove->type);

        return "{$type} - {$product->name} (Qty: {$stockMove->quantity}) @ {$warehouse->name}";
    }
}
