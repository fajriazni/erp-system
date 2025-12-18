<?php

namespace App\Http\Controllers\Sales\Crm;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\User;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $query = Deal::with(['contact', 'owner'])->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->has('stage') && $request->stage !== 'all') {
            $query->where('stage', $request->stage);
        }

        return Inertia::render('Sales/Crm/Deals/Index', [
            'deals' => $query->get(), // Kanban usually needs all deals, or at least grouped
            'columns' => [
                'prospecting' => 'Prospecting',
                'qualification' => 'Qualification',
                'proposal' => 'Proposal',
                'negotiation' => 'Negotiation',
                'closed_won' => 'Closed Won',
                'closed_lost' => 'Closed Lost',
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'stage' => 'required|string',
            'close_date' => 'nullable|date',
            'contact_id' => 'nullable|exists:contacts,id',
            'owner_id' => 'nullable|exists:users,id',
            'probability' => 'required|integer|min:0|max:100',
        ]);

        Deal::create($validated);

        return back()->with('success', 'Deal created successfully.');
    }

    public function update(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'stage' => 'required|string',
            'close_date' => 'nullable|date',
            'contact_id' => 'nullable|exists:contacts,id',
            'owner_id' => 'nullable|exists:users,id',
            'probability' => 'required|integer|min:0|max:100',
        ]);

        $deal->update($validated);

        return back()->with('success', 'Deal updated successfully.');
    }
    
    public function updateStage(Request $request, Deal $deal)
    {
         $validated = $request->validate([
            'stage' => 'required|string',
        ]);
        
        $deal->update(['stage' => $validated['stage']]);
        
        return back()->with('success', 'Deal stage updated.');
    }

    public function destroy(Deal $deal)
    {
        $deal->delete();
        return back()->with('success', 'Deal deleted successfully.');
    }
}
