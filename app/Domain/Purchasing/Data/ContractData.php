<?php

namespace App\Domain\Purchasing\Data;

use Illuminate\Http\UploadedFile;

class ContractData
{
    public function __construct(
        public int $vendor_id,
        public string $reference_number,
        public string $title,
        public string $start_date,
        public ?string $end_date,
        public string $status,
        public ?float $total_value_cap,
        public ?UploadedFile $document = null,
        public ?string $document_path = null,
        public int $renewal_reminder_days = 30,
        public bool $is_auto_renew = false,
    ) {}

    public static function fromRequest($request): self
    {
        return new self(
            vendor_id: $request->vendor_id,
            reference_number: $request->reference_number,
            title: $request->title,
            start_date: $request->start_date,
            end_date: $request->end_date,
            status: $request->status,
            total_value_cap: $request->total_value_cap,
            document: $request->file('document'),
            renewal_reminder_days: $request->renewal_reminder_days ?? 30,
            is_auto_renew: $request->boolean('is_auto_renew'),
        );
    }
}
