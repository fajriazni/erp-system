<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function edit()
    {
        $company = Company::default();

        return Inertia::render('settings/company', [
            'company' => $company,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $company = Company::default();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'currency' => 'required|string|size:3',
            'tax_id' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:1024',
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::delete($company->logo_path);
            }
            $path = $request->file('logo')->store('company-logos', 'public');
            $validated['logo_path'] = $path;
        }

        $company->update($validated);

        return back()->with('status', 'Company profile updated successfully.');
    }
}
