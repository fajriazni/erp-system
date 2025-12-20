<?php

namespace App\Notifications\Purchasing;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContractRenewalNotification extends Notification
{
    use Queueable;

    public function __construct(
        public $contract, // PurchaseAgreement or BlanketOrder
        public int $daysRemaining
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $type = class_basename($this->contract) === 'PurchaseAgreement' ? 'Contract' : 'Blanket Order';
        $ref = $this->contract->reference_number ?? $this->contract->number;

        return (new MailMessage)
            ->subject("Renewal Alert: {$type} {$ref} Expiring Soon")
            ->line("The {$type} {$ref} with {$this->contract->vendor->name} is expiring in {$this->daysRemaining} days.")
            ->action('View Details', url("/purchasing/" . ($type === 'Contract' ? 'contracts' : 'blanket-orders') . "/{$this->contract->id}"))
            ->line('Please review for renewal or termination.');
    }

    public function toArray(object $notifiable): array
    {
        $type = class_basename($this->contract) === 'PurchaseAgreement' ? 'Contract' : 'Blanket Order';
        return [
            'title' => "{$type} Expiring Soon",
            'message' => "{$type} " . ($this->contract->reference_number ?? $this->contract->number) . " expires in {$this->daysRemaining} days.",
            'contract_id' => $this->contract->id,
            'contract_type' => class_basename($this->contract),
            'days_remaining' => $this->daysRemaining,
        ];
    }
}
