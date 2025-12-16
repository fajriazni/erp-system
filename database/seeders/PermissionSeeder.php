<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Define Permissions per Module
        $modules = [
            'users' => ['index', 'create', 'edit', 'delete'],
            'roles' => ['index', 'create', 'edit', 'delete'],
            'products' => ['index', 'create', 'edit', 'delete'],
            'contacts' => ['index', 'create', 'edit', 'delete'],
            'uoms' => ['index', 'create', 'edit', 'delete'],
            'categories' => ['index', 'create', 'edit', 'delete'],
            'warehouses' => ['index', 'create', 'edit', 'delete'],
            'companies' => ['manage'], // Settings
        ];

        // 3. Create Permissions
        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "$module.$action", 'guard_name' => 'web']);
            }
        }

        // 4. Assign Permissions to Roles

        // Helper to get role (safely)
        $getRole = fn ($name) => Role::where('name', $name)->first();

        // --- Strategic Level (View All, No Edit usually, but gave manage settings) ---
        $directors = ['President Director', 'Chief Officer'];
        foreach ($directors as $roleName) {
            $role = $getRole($roleName);
            if ($role) {
                // Can view everything
                $role->givePermissionTo(Permission::where('name', 'like', '%.index')->get());
                // Can manage company settings
                $role->givePermissionTo('companies.manage');
            }
        }

        // --- Management Level (Full Control of Master Data) ---
        // Exclude Users/Roles management from Division Heads/Units for safety, only Managers?
        // Or let's assume Managers can manage everything for now.
        $managers = ['Manager', 'Head Division', 'Head Unit'];
        foreach ($managers as $roleName) {
            $role = $getRole($roleName);
            if ($role) {
                $role->givePermissionTo(Permission::all());
                // Maybe restrict User/Role management generally?
                // Let's Keep it simple: Managers manage Master Data.
            }
        }

        // --- Staff Level (Operational) ---
        $staff = $getRole('Staff');
        if ($staff) {
            // Can View Master Data items to use them in transactions
            $staff->givePermissionTo([
                'products.index',
                'contacts.index',
                'uoms.index',
                'categories.index',
                'warehouses.index',
            ]);
            // Can Create/Edit Contacts (Sales staff often add customers)
            $staff->givePermissionTo([
                'contacts.create',
                'contacts.edit',
            ]);
        }
    }
}
