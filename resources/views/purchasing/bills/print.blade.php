<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bill {{ $bill->bill_number }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body class="bg-white p-8 text-sm" onload="window.print()">
    
    <div class="max-w-4xl mx-auto border p-8">
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">VENDOR BILL</h1>
                <p class="text-gray-500">{{ $bill->bill_number }}</p>
            </div>
            <div class="text-right">
                <h2 class="font-bold text-lg">{{ config('app.name') }}</h2>
                <p class="text-gray-600">Jalan Raya Industrial No. 123</p>
                <p class="text-gray-600">Jakarta, Indonesia</p>
            </div>
        </div>

        <!-- Bill Details -->
        <div class="flex justify-between mb-8">
            <div class="w-1/2">
                <h3 class="font-bold text-gray-700 border-b pb-1 mb-2">BILL TO</h3>
                <p class="font-bold">{{ config('app.name') }}</p>
                <p>NPWP: 01.234.567.8-123.000</p>
            </div>
            <div class="w-1/2 text-right">
                <h3 class="font-bold text-gray-700 border-b pb-1 mb-2">VENDOR</h3>
                <p class="font-bold">{{ $bill->vendor->name }}</p>
                <p>{{ $bill->vendor->address }}</p>
                <p>{{ $bill->vendor->phone }}</p>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 border rounded">
            <div>
                <span class="block text-gray-500 text-xs">BILL DATE</span>
                <span class="font-bold">{{ \Carbon\Carbon::parse($bill->date)->format('d M Y') }}</span>
            </div>
            <div>
                <span class="block text-gray-500 text-xs">DUE DATE</span>
                <span class="font-bold">{{ $bill->due_date ? \Carbon\Carbon::parse($bill->due_date)->format('d M Y') : '-' }}</span>
            </div>
            <div>
                <span class="block text-gray-500 text-xs">REFERENCE</span>
                <span class="font-bold">{{ $bill->reference_number }}</span>
            </div>
            <div>
                <span class="block text-gray-500 text-xs">PO NUMBER</span>
                <span class="font-bold">{{ $bill->purchaseOrder ? $bill->purchaseOrder->document_number : '-' }}</span>
            </div>
        </div>

        <!-- Items Table -->
        <table class="w-full mb-8">
            <thead>
                <tr class="bg-gray-100 border-b text-gray-600 uppercase text-xs">
                    <th class="py-2 px-4 text-left">Item</th>
                    <th class="py-2 px-4 text-right">Qty</th>
                    <th class="py-2 px-4 text-right">Price</th>
                    <th class="py-2 px-4 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($bill->items as $item)
                <tr class="border-b">
                    <td class="py-2 px-4">
                        <div class="font-bold">{{ $item->product ? $item->product->name : 'Item' }}</div>
                        <div class="text-xs text-gray-500">{{ $item->description }}</div>
                    </td>
                    <td class="py-2 px-4 text-right">{{ $item->quantity }}</td>
                    <td class="py-2 px-4 text-right">{{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="py-2 px-4 text-right font-bold">{{ number_format($item->total, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="flex justify-end">
            <div class="w-1/3">
                <div class="flex justify-between py-1">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-bold">Rp {{ number_format($bill->subtotal, 0, ',', '.') }}</span>
                </div>
                
                @if($bill->tax_amount > 0)
                <div class="flex justify-between py-1">
                    <span class="text-gray-600">PPN ({{ $bill->tax_rate }}%) {{ $bill->tax_inclusive ? '(Incl.)' : '' }}</span>
                    <span class="font-bold">Rp {{ number_format($bill->tax_amount, 0, ',', '.') }}</span>
                </div>
                @endif

                @if($bill->withholding_tax_amount > 0)
                <div class="flex justify-between py-1 text-red-600">
                    <span class="text-gray-600">PPh 23 ({{ $bill->withholding_tax_rate }}%)</span>
                    <span class="font-bold">(Rp {{ number_format($bill->withholding_tax_amount, 0, ',', '.') }})</span>
                </div>
                @endif

                <div class="flex justify-between py-2 border-t mt-2">
                    <span class="font-bold">Total</span>
                    <span class="font-bold text-xl">Rp {{ number_format($bill->total_amount, 0, ',', '.') }}</span>
                </div>
            </div>
        </div>

        <!-- Notes -->
        @if($bill->notes)
        <div class="mt-8 pt-4 border-t">
            <h4 class="font-bold text-gray-700 text-xs mb-2">NOTES</h4>
            <p class="text-gray-600 italic">{{ $bill->notes }}</p>
        </div>
        @endif

        <div class="mt-12 text-center text-xs text-gray-400">
            Generated by system on {{ now()->format('d M Y H:i') }}
        </div>
    </div>

</body>
</html>
