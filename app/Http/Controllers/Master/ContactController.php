<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contacts = QueryBuilder::for(Contact::class)
            ->allowedFilters([
                'name',
                'email',
                'type',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%")
                            ->orWhere('email', 'like', "%{$value}%")
                            ->orWhere('phone', 'like', "%{$value}%");
                    });
                }),
            ])
            ->allowedSorts(['name', 'email', 'type', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/contacts/index', [
            'contacts' => $contacts,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/contacts/form', [
            'contact' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:customer,vendor,both',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:50',
        ]);

        Contact::create($validated);

        return redirect()->route('master.contacts.index')->with('success', 'Contact created successfully.');
    }

    public function edit(Contact $contact)
    {
        return Inertia::render('master/contacts/form', [
            'contact' => $contact,
        ]);
    }

    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'type' => 'required|in:customer,vendor,both',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:50',
        ]);

        $contact->update($validated);

        return redirect()->route('master.contacts.index')->with('success', 'Contact updated successfully.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return redirect()->route('master.contacts.index')->with('success', 'Contact deleted successfully.');
    }
}
