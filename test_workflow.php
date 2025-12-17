<?php

/**
 * Test Workflow Integration Script
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Domain\Purchasing\Services\SubmitPurchaseOrderService;
use App\Models\ApprovalTask;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkflowInstance;

echo "\n=== WORKFLOW INTEGRATION TEST ===\n\n";

// Check prerequisites
$user = User::first();
$vendor = Contact::where('type', 'vendor')->first();
$warehouse = Warehouse::first();
$product = Product::first();

if (! $user || ! $vendor || ! $warehouse || ! $product) {
    echo "❌ Missing data. Run seeders first.\n";
    exit(1);
}

// Create test PO
$po = PurchaseOrder::create([
    'vendor_id' => $vendor->id,
    'warehouse_id' => $warehouse->id,
    'document_number' => 'PO-TEST-'.now()->format('YmdHis'),
    'date' => now(),
    'status' => 'draft',
    'total' => 45000000, // 45M - Director approval
    'notes' => 'Test workflow integration',
]);

$po->items()->create([
    'product_id' => $product->id,
    'description' => $product->name,
    'quantity' => 100,
    'uom_id' => $product->uom_id,
    'unit_price' => 450000,
    'subtotal' => 45000000,
]);

echo "✓ Created PO: {$po->document_number} (Total: ".number_format($po->total).")\n\n";

// Submit PO
try {
    app(SubmitPurchaseOrderService::class)->execute($po->id);
    $po->refresh();
    echo "✓ PO submitted (Status: {$po->status})\n\n";
} catch (\Exception $e) {
    echo '❌ Submit failed: '.$e->getMessage()."\n";
    echo $e->getTraceAsString()."\n";
    exit(1);
}

// Check workflow
$instance = WorkflowInstance::where('entity_type', 'App\\Models\\PurchaseOrder')
    ->where('entity_id', $po->id)
    ->first();

if ($instance) {
    echo "✓ Workflow instance created (ID: {$instance->id}, Status: {$instance->status})\n";
    echo '  Current step: '.($instance->currentStep?->name ?? 'None')."\n\n";
} else {
    echo "❌ No workflow instance!\n";
    exit(1);
}

// Check tasks
$tasks = ApprovalTask::where('workflow_instance_id', $instance->id)->get();
echo "✓ Approval tasks: {$tasks->count()}\n";
foreach ($tasks as $task) {
    echo "  - {$task->status} | Role: ".($task->role?->name ?? 'N/A').' | Due: '.($task->due_at?->format('Y-m-d H:i') ?? 'N/A')."\n";
}

echo "\n=== SUCCESS ===\n";
echo "Go to 'My Approvals' to see task for {$po->document_number}\n\n";
