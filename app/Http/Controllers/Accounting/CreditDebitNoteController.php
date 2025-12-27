<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Finance\Services\PostCreditDebitNoteService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\CreditDebitNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreditDebitNoteController extends Controller
{
    public function __construct(
        protected PostCreditDebitNoteService $postCreditDebitNoteService
    ) {}

    /**
     * Display a listing of credit/debit notes
     */
    public function index(Request $request): Response
    {
        $query = CreditDebitNote::with('contact')
            ->latest('date');

        // Filter by type
        if ($request->has('type') && in_array($request->type, ['credit', 'debit'])) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhereHas('contact', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $notes = $query->paginate(20);

        return Inertia::render('Accounting/Notes/Index', [
            'notes' => $notes,
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new credit/debit note
     */
    public function create(Request $request): Response
    {
        $contacts = Contact::orderBy('name')->get();
        $type = $request->input('type', 'credit');
        $entityType = $request->input('entity_type', 'customer');

        return Inertia::render('Accounting/Notes/Create', [
            'contacts' => $contacts,
            'defaultType' => $type,
            'defaultEntityType' => $entityType,
            'referenceNumber' => CreditDebitNote::generateReferenceNumber($type, $entityType),
        ]);
    }

    /**
     * Store a newly created credit/debit note
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:credit,debit',
            'entity_type' => 'required|in:customer,vendor',
            'date' => 'required|date',
            'reference_type' => 'nullable|in:invoice,bill',
            'reference_id' => 'nullable|integer',
            'contact_id' => 'required|exists:contacts,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:1000',
        ]);

        $validated['reference_number'] = CreditDebitNote::generateReferenceNumber($validated['type'], $validated['entity_type']);
        $validated['status'] = 'draft';

        $note = CreditDebitNote::create($validated);

        return redirect()
            ->route('accounting.notes.show', $note)
            ->with('success', ucfirst($validated['type']).' Note created successfully.');
    }

    /**
     * Display the specified credit/debit note
     */
    public function show(CreditDebitNote $note): Response
    {
        $note->load('contact', 'journalEntry');

        // Load reference document
        $reference = $note->getReference();

        return Inertia::render('Accounting/Notes/Show', [
            'note' => $note,
            'reference' => $reference,
        ]);
    }

    /**
     * Show the form for editing the specified credit/debit note
     */
    public function edit(CreditDebitNote $note): Response|RedirectResponse
    {
        if ($note->status !== 'draft') {
            return redirect()
                ->route('accounting.notes.show', $note)
                ->with('error', 'Only draft notes can be edited.');
        }

        $contacts = Contact::orderBy('name')->get();

        return Inertia::render('Accounting/Notes/Edit', [
            'note' => $note->load('contact'),
            'contacts' => $contacts,
        ]);
    }

    /**
     * Update the specified credit/debit note
     */
    public function update(Request $request, CreditDebitNote $note): RedirectResponse
    {
        if ($note->status !== 'draft') {
            return back()->with('error', 'Only draft notes can be updated.');
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'reference_type' => 'nullable|in:invoice,bill',
            'reference_id' => 'nullable|integer',
            'contact_id' => 'required|exists:contacts,id',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:1000',
        ]);

        $note->update($validated);

        return redirect()
            ->route('accounting.notes.show', $note)
            ->with('success', 'Note updated successfully.');
    }

    /**
     * Post the credit/debit note (create journal entry)
     */
    public function post(CreditDebitNote $note): RedirectResponse
    {
        try {
            $this->postCreditDebitNoteService->execute($note);

            return redirect()
                ->route('accounting.notes.show', $note)
                ->with('success', 'Note posted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to post note: '.$e->getMessage());
        }
    }

    /**
     * Void the credit/debit note
     */
    public function void(CreditDebitNote $note): RedirectResponse
    {
        if ($note->status === 'void') {
            return back()->with('error', 'Note is already voided.');
        }

        $note->update(['status' => 'void']);

        return redirect()
            ->route('accounting.notes.show', $note)
            ->with('success', 'Note voided successfully.');
    }

    /**
     * Remove the specified credit/debit note
     */
    public function destroy(CreditDebitNote $note): RedirectResponse
    {
        if ($note->status !== 'draft') {
            return back()->with('error', 'Only draft notes can be deleted.');
        }

        $note->delete();

        return redirect()
            ->route('accounting.notes.index')
            ->with('success', 'Note deleted successfully.');
    }
}
