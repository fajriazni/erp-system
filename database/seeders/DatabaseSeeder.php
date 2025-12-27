<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            UomSeeder::class,
            CategorySeeder::class,
            WarehouseSeeder::class,
            ProductSeeder::class,
            ContactSeeder::class,
            PermissionSeeder::class,

            // Workflow seeders
            ConditionalPurchaseOrderWorkflowSeeder::class,
            PurchaseOrderPermissionSeeder::class,
            PurchaseAgreementSeeder::class,
            VendorOnboardingWorkflowSeeder::class,
            PurchaseReturnWorkflowSeeder::class,
            VendorAuditWorkflowSeeder::class,
            VendorClaimWorkflowSeeder::class,

            // Accounting seeders - Phase 1: Setup & Configuration
            AccountingSeeder::class,            // Chart of Accounts
            AccountingPeriodSeeder::class,      // Accounting Periods
            PostingRuleSeeder::class,           // Posting Rules
            JournalTemplateSeeder::class,       // Journal Templates
            GLFeatureSeeder::class,             // Beginning Balance & Additional GL features
            BeginningBalanceSeeder::class,      // Sample Beginning Balance
        ]);

        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
    }
}
