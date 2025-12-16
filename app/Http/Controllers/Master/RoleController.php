<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = QueryBuilder::for(Role::class)
            ->withCount('permissions')
            ->allowedFilters([
                'name',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where('name', 'like', "%{$value}%");
                }),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/roles/form', [
            'permissions' => Permission::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('master.roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $role->load('permissions');

        return Inertia::render('master/roles/form', [
            'role' => $role,
            'rolePermissions' => $role->permissions->pluck('name'),
            'permissions' => Permission::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('master.roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->name === 'Super Admin') {
            return redirect()->route('master.roles.index')->with('error', 'Cannot delete Super Admin role.');
        }

        $role->delete();

        return redirect()->route('master.roles.index')->with('success', 'Role deleted successfully.');
    }
}
