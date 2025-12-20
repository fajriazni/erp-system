<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PurchaseOrderPermissionSeeder extends Seeder
{
    /**
     * Seed Purchase Order related permissions
     */
    public function run(): void
    {
        $permissions = [
            // PO CRUD
            'po.create' => 'Create purchase orders',
            'po.edit' => 'Edit draft purchase orders',
            'po.delete' => 'Delete draft/cancelled purchase orders',
            'po.view' => 'View purchase orders',
            'po.list' => 'List all purchase orders',
            
            // PO Workflows
            'po.submit' => 'Submit purchase orders for approval',
            'po.approve' => 'Approve purchase orders',
            'po.reject' => 'Reject purchase orders',
            'po.cancel' => 'Cancel purchase orders',
            
            // PO Operations
            'po.print' => 'Print purchase orders',
            'po.export' => 'Export purchase orders',
            'po.receive' => 'Receive goods against purchase orders',
        ];

        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['guard_name' => 'web']
            );
        }

        $this->command->info('Purchase Order permissions created successfully.');
    }
}
