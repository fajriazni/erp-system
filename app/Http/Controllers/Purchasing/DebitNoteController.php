<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\DebitNoteService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\DebitNote;
use App\Models\VendorBill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DebitNoteController extends Controller
{
    public function __construct(
        protected DebitNoteService $debitNoteService
    ) {}

    public function index()
    {
        $debitNotes = DebitNote::with(['vendor', 'purchaseReturn'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Purchasing/debit-notes/Index', [
            'debitNotes' => $debitNotes,
        ]);
    }

    public function create()
    {
        $vendors = Contact::where('type', 'vendor')->get();

        return Inertia::render('Purchasing/debit-notes/Create', [
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'date' => 'required|date',
            'total_amount' => 'required|numeric|min:0.01',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $debitNote = DebitNote::create($validated + [
            'debit_note_number' => 'DN-'.now()->format('YmdHis'),
            'status' => 'unposted',
            'remaining_amount' => $validated['total_amount'],
        ]);

        return redirect()->route('purchasing.debit-notes.show', $debitNote)
            ->with('success', 'Debit note created successfully');
    }

    public function show(DebitNote $debitNote)
    {
        $debitNote->load(['vendor', 'purchaseReturn', 'applications.vendorBill']);

        // Get available open bills for this vendor
        $openBills = VendorBill::where('vendor_id', $debitNote->vendor_id)
            ->where('status', 'posted')
            ->where('total_amount', '>', 0)
            ->get();

        return Inertia::render('Purchasing/debit-notes/Show', [
            'debitNote' => $debitNote,
            'openBills' => $openBills,
        ]);
    }

    public function edit(DebitNote $debitNote)
    {
        if ($debitNote->status !== 'unposted') {
            return redirect()->route('purchasing.debit-notes.show', $debitNote)
                ->with('error', 'Only unposted debit notes can be edited');
        }

        $vendors = Contact::where('type', 'vendor')->get();

        return Inertia::render('Purchasing/debit-notes/Edit', [
            'debitNote' => $debitNote,
            'vendors' => $vendors,
        ]);
    }

    public function update(Request $request, DebitNote $debitNote)
    {
        if ($debitNote->status !== 'unposted') {
            return back()->with('error', 'Only unposted debit notes can be updated');
        }

        $validated = $request->validate([
            'total_amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $debitNote->update($validated);

        return redirect()->route('purchasing.debit-notes.show', $debitNote)
            ->with('success', 'Debit note updated successfully');
    }

    public function destroy(DebitNote $debitNote)
    {
        if ($debitNote->status !== 'unposted') {
            return back()->with('error', 'Only unposted debit notes can be deleted');
        }

        $debitNote->delete();

        return redirect()->route('purchasing.debit-notes.index')
            ->with('success', 'Debit note deleted successfully');
    }

    // Workflow actions
    public function post(DebitNote $debitNote)
    {
        $this->debitNoteService->post($debitNote);

        return back()->with('success', 'Debit note posted successfully');
    }

    public function apply(Request $request, DebitNote $debitNote)
    {
        $validated = $request->validate([
            'vendor_bill_id' => 'required|exists:vendor_bills,id',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $bill = VendorBill::findOrFail($validated['vendor_bill_id']);

        $this->debitNoteService->applyToInvoice($debitNote, $bill, $validated['amount']);

        return back()->with('success', 'Debit note applied to invoice successfully');
    }

    public function void(Request $request, DebitNote $debitNote)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $this->debitNoteService->void($debitNote, $validated['reason']);

        return back()->with('success', 'Debit note voided successfully');
    }
}
