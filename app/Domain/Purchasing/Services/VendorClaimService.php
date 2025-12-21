<?php

namespace App\Domain\Purchasing\Services;

use App\Models\VendorClaim;
use Illuminate\Support\Facades\DB;

class VendorClaimService
{
    /**
     * Submit new claim
     */
    public function submitClaim(array $data): VendorClaim
    {
        return DB::transaction(function () use ($data) {
            $claim = VendorClaim::create([
                'claim_number' => $this->generateClaimNumber(),
                'purchase_order_id' => $data['purchase_order_id'] ?? null,
                'goods_receipt_id' => $data['goods_receipt_id'] ?? null,
                'vendor_id' => $data['vendor_id'],
                'claim_type' => $data['claim_type'],
                'claim_date' => $data['claim_date'] ?? now(),
                'claim_amount' => $data['claim_amount'],
                'description' => $data['description'],
                'evidence_attachments' => $data['evidence_attachments'] ?? null,
                'status' => 'submitted',
                'submitted_by' => auth()->id(),
            ]);

            // Notify procurement team
            // event(new ClaimSubmitted($claim));

            return $claim;
        });
    }

    /**
     * Review claim
     */
    public function review(VendorClaim $claim): void
    {
        if ($claim->status !== 'submitted') {
            throw new \Exception('Only submitted claims can be reviewed');
        }

        $claim->review(auth()->user());
    }

    /**
     * Approve claim
     */
    public function approve(VendorClaim $claim): void
    {
        if (! in_array($claim->status, ['submitted', 'under_review', 'disputed'])) {
            throw new \Exception('Claim cannot be approved in current status');
        }

        DB::transaction(function () use ($claim) {
            $claim->approve();
        });
    }

    /**
     * Dispute claim
     */
    public function dispute(VendorClaim $claim, string $reason): void
    {
        if ($claim->status === 'settled') {
            throw new \Exception('Cannot dispute settled claim');
        }

        DB::transaction(function () use ($claim, $reason) {
            $claim->dispute($reason);
        });
    }

    /**
     * Settle claim
     */
    public function settle(VendorClaim $claim, array $data): void
    {
        if ($claim->status !== 'approved') {
            throw new \Exception('Only approved claims can be settled');
        }

        DB::transaction(function () use ($claim, $data) {
            $claim->settle(
                $data['settlement_type'],
                $data['settlement_amount']
            );

            // Handle different settlement types
            switch ($data['settlement_type']) {
                case 'credit_note':
                    // Debit note already created in model
                    break;

                case 'replacement':
                    // Create replacement order logic here
                    break;

                case 'refund':
                    // Create receivable entry
                    break;
            }
        });
    }

    /**
     * Reject claim
     */
    public function reject(VendorClaim $claim, string $reason): void
    {
        if ($claim->status === 'settled') {
            throw new \Exception('Cannot reject settled claim');
        }

        DB::transaction(function () use ($claim, $reason) {
            $claim->reject($reason);
        });
    }

    protected function generateClaimNumber(): string
    {
        $year = now()->format('y');
        $month = now()->format('m');

        $lastClaim = VendorClaim::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->latest('id')
            ->first();

        $sequence = $lastClaim ? ((int) substr($lastClaim->claim_number, -4)) + 1 : 1;

        return sprintf('CLM-%s%s-%04d', $year, $month, $sequence);
    }
}
