<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Product;
use App\Models\Uom;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class LawangsewuSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $roles = ['Admin', 'Director', 'Manager', 'Staff'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // 2. Departments
        $techDept = Department::firstOrCreate(['code' => 'TECH'], ['name' => 'Technology']);
        $opsDept = Department::firstOrCreate(['code' => 'OPS'], ['name' => 'Operations']);
        $finDept = Department::firstOrCreate(['code' => 'FIN'], ['name' => 'Finance']);
        $procDept = Department::firstOrCreate(['code' => 'PROC'], ['name' => 'Procurement']);

        // 3. Budgets (Annual)
        Budget::firstOrCreate(
            ['name' => 'Tech Budget '.date('Y')],
            [
                'department_id' => $techDept->id,
                'fiscal_year' => date('Y'),
                'amount' => 1000000000,
            ]
        );
        Budget::firstOrCreate(
            ['name' => 'Ops Budget '.date('Y')],
            [
                'department_id' => $opsDept->id,
                'fiscal_year' => date('Y'),
                'amount' => 500000000,
            ]
        );

        // 4. Users
        $users = [
            [
                'name' => 'Budi Director',
                'email' => 'director@lawangsewu.tech',
                'role' => 'Director',
                'dept_id' => null,
            ],
            [
                'name' => 'Andi IT Manager',
                'email' => 'it.manager@lawangsewu.tech',
                'role' => 'Manager',
                'dept_id' => $techDept->id,
            ],
            [
                'name' => 'Siti Finance Manager',
                'email' => 'finance.manager@lawangsewu.tech',
                'role' => 'Manager',
                'dept_id' => $finDept->id,
            ],
            [
                'name' => 'Rudi IT Staff',
                'email' => 'it.staff@lawangsewu.tech',
                'role' => 'Staff',
                'dept_id' => $techDept->id,
            ],
            [
                'name' => 'Dewi Purchasing',
                'email' => 'purchasing@lawangsewu.tech',
                'role' => 'Staff',
                'dept_id' => $procDept->id,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'department_id' => $userData['dept_id'],
                ]
            );
            $user->assignRole($userData['role']);
        }

        // 5. UOMs
        $unit = Uom::firstOrCreate(['name' => 'Unit'], ['symbol' => 'Unit']);
        $pcs = Uom::firstOrCreate(['name' => 'Pieces'], ['symbol' => 'Pcs']);
        $month = Uom::firstOrCreate(['name' => 'Month'], ['symbol' => 'Mo']);
        $hour = Uom::firstOrCreate(['name' => 'Hour'], ['symbol' => 'Hr']);

        // 6. Vendors
        $vendors = [
            ['name' => 'PT. Mega Komputindo', 'email' => 'sales@megakom.com', 'phone' => '021-5551234', 'tax_id' => '01.234.567.8-001.000'],
            ['name' => 'Global Cloud Services', 'email' => 'billing@globalcloud.com', 'phone' => '021-5559876', 'tax_id' => '02.345.678.9-002.000'],
            ['name' => 'CV. Jasa Kabel', 'email' => 'info@jasakabel.com', 'phone' => '024-8456789', 'tax_id' => '03.456.789.0-003.000'],
            ['name' => 'PT. Server Indo', 'email' => 'sales@serverindo.co.id', 'phone' => '021-5554321', 'tax_id' => '04.567.890.1-004.000'],
            ['name' => 'CV. Network Solusi', 'email' => 'marketing@netsolusi.com', 'phone' => '024-8451234', 'tax_id' => '05.678.901.2-005.000'],
        ];

        foreach ($vendors as $v) {
            Contact::updateOrCreate(
                ['email' => $v['email']],
                [
                    'type' => 'vendor',
                    'name' => $v['name'],
                    'phone' => $v['phone'],
                    'tax_id' => $v['tax_id'],
                ]
            );
        }

        // 7. Warehouses
        $dcWarehouse = \App\Models\Warehouse::firstOrCreate(['name' => 'Main Data Center'], ['address' => 'Jakarta DC']);
        $officeWarehouse = \App\Models\Warehouse::firstOrCreate(['name' => 'Head Office Storage'], ['address' => 'Semarang HQ']);

        // 8. Products
        $productsData = [
            ['code' => 'SRV-001', 'name' => 'Dell PowerEdge R740 Server', 'type' => 'goods', 'price' => 55000000, 'cost' => 45000000, 'uom_id' => $unit->id],
            ['code' => 'NET-001', 'name' => 'Cisco Catalyst 2960-X Switch', 'type' => 'goods', 'price' => 18000000, 'cost' => 15000000, 'uom_id' => $unit->id],
            ['code' => 'SUB-001', 'name' => 'AWS Cloud Subscription', 'type' => 'service', 'price' => 6000000, 'cost' => 5000000, 'uom_id' => $month->id],
            ['code' => 'SVC-001', 'name' => 'IT Consulting Service', 'type' => 'service', 'price' => 2500000, 'cost' => 1000000, 'uom_id' => $hour->id],
            // New Products
            ['code' => 'LAP-001', 'name' => 'Lenovo ThinkPad X1 Carbon', 'type' => 'goods', 'price' => 28000000, 'cost' => 24000000, 'uom_id' => $unit->id],
            ['code' => 'LAP-002', 'name' => 'MacBook Pro 14 M3', 'type' => 'goods', 'price' => 32000000, 'cost' => 28000000, 'uom_id' => $unit->id],
            ['code' => 'MON-001', 'name' => 'Dell UltraSharp 27 Monitor', 'type' => 'goods', 'price' => 8500000, 'cost' => 7000000, 'uom_id' => $unit->id],
            ['code' => 'CAB-001', 'name' => 'Cat6 LAN Cable Roll (305m)', 'type' => 'goods', 'price' => 1500000, 'cost' => 1100000, 'uom_id' => $unit->id],
            ['code' => 'HDD-001', 'name' => 'Seagate Exos 16TB HDD', 'type' => 'goods', 'price' => 6500000, 'cost' => 5200000, 'uom_id' => $unit->id],
            ['code' => 'SSD-001', 'name' => 'Samsung 990 Pro 2TB NVMe', 'type' => 'goods', 'price' => 3800000, 'cost' => 3100000, 'uom_id' => $unit->id],
            ['code' => 'LIC-001', 'name' => 'Microsoft 365 Business Std', 'type' => 'service', 'price' => 180000, 'cost' => 150000, 'uom_id' => $month->id],
            ['code' => 'LIC-002', 'name' => 'Adobe Creative Cloud', 'type' => 'service', 'price' => 800000, 'cost' => 700000, 'uom_id' => $month->id],
            ['code' => 'SVC-002', 'name' => 'Server Maintenance', 'type' => 'service', 'price' => 1500000, 'cost' => 800000, 'uom_id' => $hour->id],
            ['code' => 'SVC-003', 'name' => 'Network Installation', 'type' => 'service', 'price' => 3000000, 'cost' => 1500000, 'uom_id' => $hour->id],
            ['code' => 'UPS-001', 'name' => 'APC Smart-UPS 3000VA', 'type' => 'goods', 'price' => 18000000, 'cost' => 14500000, 'uom_id' => $unit->id],
        ];

        $allProductModels = [];
        foreach ($productsData as $p) {
            $product = Product::firstOrCreate(
                ['code' => $p['code']],
                [
                    'name' => $p['name'],
                    'notes' => $p['name'].' Description',
                    'type' => $p['type'],
                    'uom_id' => $p['uom_id'],
                    'cost' => $p['cost'],
                    'price' => $p['price'],
                ]
            );
            $allProductModels[] = $product;
        }

        // 9. Initial Stock (Example for specific item)
        $switch = Product::where('code', 'NET-001')->first();
        if ($switch && $switch->wasRecentlyCreated) {
            $switch->warehouses()->attach($officeWarehouse->id, ['quantity' => 5]);
        }

        // 10. Vendor Pricelists
        $createdVendors = Contact::whereIn('email', array_column($vendors, 'email'))->get();

        foreach ($createdVendors as $vendor) {
            // Pick random 4 to 12 products for this vendor
            $numProducts = rand(4, 12);
            // Ensure we don't try to pick more than exist
            $numProducts = min($numProducts, count($allProductModels));

            $vendorProducts = collect($allProductModels)->random($numProducts);

            foreach ($vendorProducts as $product) {
                // Randomize price slightly (± 15% for more variance)
                $basePrice = $product->price;
                $randomFactor = rand(85, 115) / 100;
                $vendorPrice = $basePrice * $randomFactor;

                \App\Models\VendorPricelist::firstOrCreate(
                    [
                        'vendor_id' => $vendor->id,
                        'product_id' => $product->id,
                    ],
                    [
                        'price' => $vendorPrice,
                        'min_quantity' => 1,
                        'vendor_product_code' => strtoupper(substr($vendor->name, 0, 3)).'-'.$product->code,
                        'vendor_product_name' => $product->name.' ('.$vendor->name.')',
                    ]
                );
            }
        }

        // 11. Approval Rules
        $directorRole = Role::where('name', 'Director')->first();
        $managerRole = Role::where('name', 'Manager')->first();

        // Purchase Request Workflow
        $directorUser = User::where('email', 'director@lawangsewu.tech')->first();

        $prWorkflow = \App\Models\Workflow::updateOrCreate(
            ['module' => 'purchasing', 'entity_type' => 'App\\Models\\PurchaseRequest'],
            [
                'name' => 'Purchase Request Approval',
                'description' => 'Approval workflow for Purchase Requests',
                'is_active' => true,
                'created_by' => $directorUser ? $directorUser->id : 1,
            ]
        );

        // Step 1: Manager Approval (Always)
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $prWorkflow->id, 'step_number' => 1],
            [
                'name' => 'Manager Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$managerRole->id],
                    ],
                ],
            ]
        );

        // Step 2: Director Approval (Only if > 100M)
        $directorStep = \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $prWorkflow->id, 'step_number' => 2],
            [
                'name' => 'Director Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$directorRole->id],
                    ],
                ],
            ]
        );

        // Director Step Condition
        \App\Models\WorkflowCondition::updateOrCreate(
            [
                'workflow_step_id' => $directorStep->id,
                'field_path' => 'total_amount',
            ],
            [
                'operator' => '>=',
                'value' => 100000000,
                'group_number' => 1,
            ]
        );

        // Purchase Order Workflow
        $poWorkflow = \App\Models\Workflow::updateOrCreate(
            ['module' => 'purchasing', 'entity_type' => 'App\\Models\\PurchaseOrder'],
            [
                'name' => 'Purchase Order Approval',
                'description' => 'Approval workflow for Purchase Orders',
                'is_active' => true,
                'created_by' => $directorUser ? $directorUser->id : 1,
            ]
        );

        // Step 1: Manager Approval (Always)
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $poWorkflow->id, 'step_number' => 1],
            [
                'name' => 'Manager Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$managerRole->id],
                    ],
                ],
            ]
        );

        // Step 2: Director Approval (Only if > 50M)
        $directorPoStep = \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $poWorkflow->id, 'step_number' => 2],
            [
                'name' => 'Director Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$directorRole->id],
                    ],
                ],
            ]
        );

        // Director PO Step Condition
        \App\Models\WorkflowCondition::updateOrCreate(
            [
                'workflow_step_id' => $directorPoStep->id,
                'field_path' => 'total_amount',
            ],
            [
                'operator' => '>=',
                'value' => 50000000,
                'group_number' => 1,
            ]
        );

        // --- PURCHASE RFQ WORKFLOW ---
        $rfqWorkflow = \App\Models\Workflow::updateOrCreate(
            ['module' => 'purchasing', 'entity_type' => 'App\\Models\\PurchaseRfq'],
            [
                'name' => 'Purchase RFQ Approval',
                'description' => 'Simple approval for sending RFQs',
                'is_active' => true,
                'created_by' => $directorUser ? $directorUser->id : 1,
            ]
        );
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $rfqWorkflow->id, 'step_number' => 1],
            [
                'name' => 'Manager Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$managerRole->id],
                    ],
                ],
            ]
        );

        // --- PURCHASE RETURN WORKFLOW ---
        $returnWorkflow = \App\Models\Workflow::updateOrCreate(
            ['module' => 'purchasing', 'entity_type' => 'App\\Models\\PurchaseReturn'],
            [
                'name' => 'Purchase Return Approval',
                'description' => 'Approval for returning goods to vendor',
                'is_active' => true,
                'created_by' => $directorUser ? $directorUser->id : 1,
            ]
        );
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $returnWorkflow->id, 'step_number' => 1],
            [
                'name' => 'Manager Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$managerRole->id],
                    ],
                ],
            ]
        );

        // --- VENDOR BILL WORKFLOW ---
        $billWorkflow = \App\Models\Workflow::updateOrCreate(
            ['module' => 'finance', 'entity_type' => 'App\\Models\\VendorBill'],
            [
                'name' => 'Vendor Bill Approval',
                'description' => 'Approval for vendor bills (3-Way Match)',
                'is_active' => true,
                'created_by' => $directorUser ? $directorUser->id : 1,
            ]
        );
        // Step 1: Manager
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $billWorkflow->id, 'step_number' => 1],
            [
                'name' => 'Finance Manager Verification',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$managerRole->id],
                    ],
                ],
            ]
        );
        // Step 2: Director (> 100M)
        $directorBillStep = \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $billWorkflow->id, 'step_number' => 2],
            [
                'name' => 'Director Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$directorRole->id],
                    ],
                ],
            ]
        );
        \App\Models\WorkflowCondition::updateOrCreate(
            [
                'workflow_step_id' => $directorBillStep->id,
                'field_path' => 'total_amount',
            ],
            [
                'operator' => '>=',
                'value' => 100000000,
                'group_number' => 1,
            ]
        );

        // --- VENDOR PAYMENT WORKFLOW ---
        $paymentWorkflow = \App\Models\Workflow::updateOrCreate(
            ['module' => 'finance', 'entity_type' => 'App\\Models\\VendorPayment'],
            [
                'name' => 'Vendor Payment Approval',
                'description' => 'Strict approval for outbound payments',
                'is_active' => true,
                'created_by' => $directorUser ? $directorUser->id : 1,
            ]
        );
        // Step 1: Manager
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $paymentWorkflow->id, 'step_number' => 1],
            [
                'name' => 'Finance Manager Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$managerRole->id],
                    ],
                ],
            ]
        );
        // Step 2: Director (Always)
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $paymentWorkflow->id, 'step_number' => 2],
            [
                'name' => 'Director Authorization',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$directorRole->id],
                    ],
                ],
            ]
        );

        // --- BUDGET ADJUSTMENT WORKFLOW ---
        $budgetWorkflow = \App\Models\Workflow::updateOrCreate(
            ['module' => 'finance', 'entity_type' => 'App\\Models\\Budget'],
            [
                'name' => 'Budget Adjustment Approval',
                'description' => 'Approval for budget changes',
                'is_active' => true,
                'created_by' => $directorUser ? $directorUser->id : 1,
            ]
        );
        \App\Models\WorkflowStep::updateOrCreate(
            ['workflow_id' => $budgetWorkflow->id, 'step_number' => 1],
            [
                'name' => 'Director Approval',
                'config' => [
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$directorRole->id],
                    ],
                ],
            ]
        );
    }
}
