<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@erp.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        // Ensure role exists before assigning. RoleSeeder should run before this.
        if (Role::where('name', 'Super Admin')->exists()) {
            $admin->assignRole('Super Admin');
        }

        // 2. Manager
        $manager = User::firstOrCreate(
            ['email' => 'manager@erp.com'],
            [
                'name' => 'Operational Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (Role::where('name', 'Manager')->exists()) {
            $manager->assignRole('Manager');
        }

        // 3. Staff
        $staff = User::firstOrCreate(
            ['email' => 'staff@erp.com'],
            [
                'name' => 'General Staff',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (Role::where('name', 'Staff')->exists()) {
            $staff->assignRole('Staff');
        }
    }
}
