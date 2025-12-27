<?php

namespace Tests\Feature\Accounting;

use App\Models\Contact;
use App\Models\CreditDebitNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreditDebitNoteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
        $this->seed(\Database\Seeders\AccountingSeeder::class);
    }

    public function test_can_view_notes_index()
    {
        $response = $this->get(route('accounting.notes.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_credit_note()
    {
        $contact = Contact::factory()->create(['type' => 'customer']);

        $response = $this->post(route('accounting.notes.store'), [
            'type' => 'credit',
            'date' => now()->toDateString(),
            'contact_id' => $contact->id,
            'amount' => 1000000,
            'reason' => 'Test Credit Note',
            'reference_type' => null,
            'reference_id' => null,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('credit_debit_notes', [
            'type' => 'credit',
            'amount' => 1000000,
            'contact_id' => $contact->id,
            'remaining_amount' => 0, // Should be 0 until posted? No, default is 0.
        ]);
    }

    public function test_can_post_credit_note()
    {
        $contact = Contact::factory()->create(['type' => 'customer']);
        $note = CreditDebitNote::create([
            'type' => 'credit',
            'reference_number' => 'CN-TEST-001',
            'date' => now(),
            'contact_id' => $contact->id,
            'amount' => 500000,
            'reason' => 'Test',
            'status' => 'draft',
        ]);

        $response = $this->post(route('accounting.notes.post', $note));

        $response->assertRedirect();
        $note->refresh();

        $this->assertEquals('posted', $note->status);
        $this->assertEquals(500000, $note->remaining_amount);
        $this->assertNotNull($note->journal_entry_id);
    }

    public function test_can_create_debit_note()
    {
        $contact = Contact::factory()->create(['type' => 'vendor']);

        $response = $this->post(route('accounting.notes.store'), [
            'type' => 'debit',
            'date' => now()->toDateString(),
            'contact_id' => $contact->id,
            'amount' => 750000,
            'reason' => 'Test Debit Note',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('credit_debit_notes', [
            'type' => 'debit',
            'amount' => 750000,
        ]);
    }
}
