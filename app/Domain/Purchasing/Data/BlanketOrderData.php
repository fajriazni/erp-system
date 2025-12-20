<?php

namespace App\Domain\Purchasing\Data;

class BlanketOrderData
{
    public function __construct(
        public int $vendor_id,
        public ?int $purchase_agreement_id,
        public string $number,
        public string $start_date,
        public ?string $end_date,
        public float $amount_limit,
        public string $status,
        public array $lines = [],
        public int $renewal_reminder_days = 30,
        public bool $is_auto_renew = false,
    ) {}

    public static function fromRequest($request): self
    {
        return new self(
            vendor_id: $request->vendor_id,
            purchase_agreement_id: $request->purchase_agreement_id,
            number: $request->number,
            start_date: $request->start_date,
            end_date: $request->end_date,
            amount_limit: $request->amount_limit,
            status: $request->status,
            lines: $request->lines ?? [],
            renewal_reminder_days: $request->renewal_reminder_days ?? 30,
            is_auto_renew: $request->boolean('is_auto_renew'),
        );
    }
}
