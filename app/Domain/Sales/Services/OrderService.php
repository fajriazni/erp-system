<?php

namespace App\Domain\Sales\Services;

use App\Models\SalesOrder;
use App\Models\SalesOrderLine;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createOrder(array $data): SalesOrder
    {
        return DB::transaction(function () use ($data) {
            $order = SalesOrder::create([
                'customer_id' => $data['customer_id'],
                'warehouse_id' => $data['warehouse_id'],
                'document_number' => $this->generateDocumentNumber(),
                'date' => $data['date'],
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $taxAmount = 0; // Tax logic to be added

                SalesOrderLine::create([
                    'sales_order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                ]);
            }

            $this->recalculateTotals($order);
            return $order;
        });
    }

    public function recalculateTotals(SalesOrder $order): void
    {
        $order->subtotal = $order->items()->sum('subtotal');
        $order->tax_amount = $order->items()->sum('tax_amount');
        $order->total = $order->subtotal + $order->tax_amount;
        $order->save();
    }

    private function generateDocumentNumber(): string
    {
        // Simple generation logic, can be enhanced
        return 'SO-' . date('Ymd') . '-' . strtoupper(uniqid());
    }
}
