<?php

namespace App\Domain\Finance\Events;

use App\Models\ChartOfAccount;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChartOfAccountUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly ChartOfAccount $account,
        public readonly array $changes,
    ) {}
}
