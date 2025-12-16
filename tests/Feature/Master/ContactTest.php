<?php

use App\Models\Contact;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($role);
});

test('contacts index page is displayed', function () {
    $this->actingAs($this->user)
        ->get('/master/contacts')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/contacts/index')
        );
});

test('can create a new contact', function () {
    $contactData = [
        'name' => 'Test Contact',
        'type' => 'customer',
        'email' => 'test@example.com',
        'phone' => '08123456789',
        'address' => 'Test Address',
        'tax_id' => '123.456.789',
    ];

    $this->actingAs($this->user)
        ->post('/master/contacts', $contactData)
        ->assertRedirect('/master/contacts');

    $this->assertDatabaseHas('contacts', [
        'name' => 'Test Contact',
        'email' => 'test@example.com',
    ]);
});

test('can update a contact', function () {
    $contact = Contact::factory()->create();

    $this->actingAs($this->user)
        ->put("/master/contacts/{$contact->id}", [
            'name' => 'Updated Contact',
            'type' => 'vendor',
            'email' => $contact->email,
            'phone' => '08198765432',
            'address' => 'Updated Address',
            'tax_id' => $contact->tax_id,
        ])
        ->assertRedirect('/master/contacts');

    $this->assertDatabaseHas('contacts', [
        'id' => $contact->id,
        'name' => 'Updated Contact',
        'type' => 'vendor',
    ]);
});

test('can delete a contact', function () {
    $contact = Contact::factory()->create();

    $this->actingAs($this->user)
        ->delete("/master/contacts/{$contact->id}")
        ->assertRedirect('/master/contacts');

    $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
});

test('contact validation fails for required fields', function () {
    $this->actingAs($this->user)
        ->post('/master/contacts', [])
        ->assertSessionHasErrors(['name', 'type']);
});

test('contact email validation', function () {
    $this->actingAs($this->user)
        ->post('/master/contacts', [
            'name' => 'Test',
            'type' => 'customer',
            'email' => 'invalid-email',
        ])
        ->assertSessionHasErrors(['email']);
});
