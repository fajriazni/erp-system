<?php

namespace Tests\Feature\Purchasing;

use App\Mail\Purchasing\SendRfqToVendor;
use App\Models\Contact;
use App\Models\PurchaseRfq;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RfqEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_sends_email_to_invited_vendors()
    {
        Mail::fake();

        $user = User::factory()->create();
        $this->actingAs($user);

        $rfq = PurchaseRfq::create([
            'document_number' => 'RFQ-TEST-001-'.uniqid(),
            'title' => 'Test RFQ',
            'deadline' => now()->addDays(7),
            'status' => 'draft',
            'created_by' => $user->id,
            'user_id' => $user->id, // Add this line
        ]);

        $vendor1 = Contact::factory()->create(['email' => 'vendor1@example.com', 'type' => 'vendor']);
        $vendor2 = Contact::factory()->create(['email' => 'vendor2@example.com', 'type' => 'vendor']);

        $response = $this->post(route('purchasing.rfqs.invite', $rfq), [
            'vendor_ids' => [$vendor1->id, $vendor2->id],
        ]);

        $response->assertSessionHas('success');

        Mail::assertSent(SendRfqToVendor::class, function ($mail) {
            return $mail->hasTo('vendor1@example.com');
        });

        Mail::assertSent(SendRfqToVendor::class, function ($mail) {
            return $mail->hasTo('vendor2@example.com');
        });

        $this->assertEquals('open', $rfq->fresh()->status);
    }
}
