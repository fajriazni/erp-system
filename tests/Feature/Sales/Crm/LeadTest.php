<?php

use App\Models\Lead;
use App\Models\User;

test('leads screen can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('sales.leads.index'));

    $response->assertStatus(200);
});

test('can create a lead', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('sales.leads.store'), [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'company_name' => 'Acme Corp',
        'email' => 'john@acme.com',
        'status' => 'new',
    ]);

    $response->assertRedirect(route('sales.leads.index'));
    
    $this->assertDatabaseHas('leads', [
        'first_name' => 'John',
        'email' => 'john@acme.com',
    ]);
});

test('can update a lead', function () {
    $user = User::factory()->create();
    $lead = Lead::create([
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'status' => 'new',
    ]);

    $response = $this->actingAs($user)->put(route('sales.leads.update', $lead), [
        'first_name' => 'Jane Updated',
        'status' => 'contacted',
    ]);

    $response->assertRedirect(route('sales.leads.index'));
    
    $this->assertDatabaseHas('leads', [
        'id' => $lead->id,
        'first_name' => 'Jane Updated',
        'status' => 'contacted',
    ]);
});

test('can delete a lead', function () {
    $user = User::factory()->create();
    $lead = Lead::create([
        'first_name' => 'To Delete',
        'status' => 'new',
    ]);

    $response = $this->actingAs($user)->delete(route('sales.leads.destroy', $lead));

    $response->assertStatus(302); // Redirect back
    
    $this->assertDatabaseMissing('leads', [
        'id' => $lead->id,
    ]);
});
