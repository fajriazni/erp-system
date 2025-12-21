<?php

namespace App\Domain\Purchasing\Events;

use App\Models\PurchaseAgreement;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PurchaseAgreementSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(public PurchaseAgreement $purchaseAgreement) {}
}
