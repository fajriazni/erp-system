<?php

namespace App\Domain\Accounting\Services;

use App\Domain\Accounting\Aggregates\PostingRule\PostingRule;
use App\Models\PostingRule as PostingRuleModel;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class AutomatedPostingService
{
    public function __construct(
        protected JournalEntryService $journalEntryService
    ) {}

    /**
     * Handle an automated posting event.
     *
     * @param string $eventType The event identifier (e.g., 'sales.invoice.posted')
     * @param array $payload The event data payload
     * @param string $referenceNumber The reference number for the journal entry
     * @param string $description The description for the journal entry
     * @param string $date The date of the transaction (Y-m-d)
     * @return void
     */
    public function handle(string $eventType, array $payload, string $referenceNumber, string $description, string $date): void
    {
        // 1. Find active posting rule
        $rule = PostingRuleModel::where('event_type', $eventType)
            ->where('is_active', true)
            ->with('lines')
            ->first();

        if (! $rule) {
            // No rule defined for this event, skip gracefully
            return;
        }

        // 2. Process lines
        $journalLines = [];
        foreach ($rule->lines as $ruleLine) {
            $amount = $this->resolveAmount($ruleLine->amount_key, $payload);
            
            // Skip zero amounts
            if ($amount <= 0) {
                continue;
            }

            $lineDescription = $this->resolveDescription($ruleLine->description_template, $payload, $description);

            $journalLines[] = [
                'account_id' => $ruleLine->chart_of_account_id,
                'debit' => $ruleLine->debit_credit === 'debit' ? $amount : 0,
                'credit' => $ruleLine->debit_credit === 'credit' ? $amount : 0,
                'description' => $lineDescription,
            ];
        }

        // 3. Create Journal Entry
        if (! empty($journalLines)) {
            $this->journalEntryService->createEntry(
                $referenceNumber,
                $date,
                $description,
                $journalLines
            );
        }
    }

    /**
     * Resolve the amount from the payload using dot notation key.
     */
    protected function resolveAmount(string $key, array $payload): float
    {
        return (float) Arr::get($payload, $key, 0);
    }

    /**
     * Resolve description template.
     * Replaces {key} with value from payload.
     */
    protected function resolveDescription(?string $template, array $payload, string $default): string
    {
        if (empty($template)) {
            return $default;
        }

        // Find all matches for {key}
        preg_match_all('/\{([^}]+)\}/', $template, $matches);

        $replacements = [];
        foreach ($matches[1] as $key) {
            $value = Arr::get($payload, $key, '');
            $replacements['{'.$key.'}'] = $value;
        }

        return strtr($template, $replacements);
    }
}
