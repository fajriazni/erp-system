<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order - {{ $order->order_number }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body class="bg-white p-8" onload="window.print()">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">PURCHASE ORDER</h1>
            <div class="flex justify-between">
                <div>
                    <p class="text-sm text-gray-600">Order Number</p>
                    <p class="text-lg font-semibold">{{ $order->order_number }}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600">Status</p>
                    <span class="inline-block px-3 py-1 text-sm font-medium rounded-full
                        @if($order->status === 'approved') bg-green-100 text-green-800
                        @elseif($order->status === 'pending') bg-yellow-100 text-yellow-800
                        @else bg-gray-100 text-gray-800
                        @endif">
                        {{ ucfirst($order->status) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Vendor and Order Info -->
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h2 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Vendor</h2>
                <div class="border-l-4 border-blue-500 pl-4">
                    <p class="font-bold text-gray-900">{{ $order->vendor->name }}</p>
                    <p class="text-sm text-gray-600">{{ $order->vendor->address }}</p>
                    <p class="text-sm text-gray-600">{{ $order->vendor->email }}</p>
                    <p class="text-sm text-gray-600">{{ $order->vendor->phone }}</p>
                </div>
            </div>
            <div>
                <h2 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Order Details</h2>
                <table class="text-sm w-full">
                    <tr>
                        <td class="text-gray-600 py-1">Order Date:</td>
                        <td class="font-medium">{{ \Carbon\Carbon::parse($order->date)->format('d M Y') }}</td>
                    </tr>
                    <tr>
                        <td class="text-gray-600 py-1">Expected Date:</td>
                        <td class="font-medium">{{ $order->expected_date ? \Carbon\Carbon::parse($order->expected_date)->format('d M Y') : '-' }}</td>
                    </tr>
                    @if($order->reference_number)
                    <tr>
                        <td class="text-gray-600 py-1">Reference:</td>
                        <td class="font-medium">{{ $order->reference_number }}</td>
                    </tr>
                    @endif
                </table>
            </div>
        </div>

        <!-- Items Table -->
        <div class="mb-8">
            <h2 class="text-sm font-semibold text-gray-700 mb-3 uppercase">Order Items</h2>
            <table class="w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">#</th>
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Product</th>
                        <th class="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Qty</th>
                        <th class="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Unit Price</th>
                        <th class="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $index => $item)
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 text-sm">{{ $index + 1 }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <div class="font-medium">{{ $item->product->name }}</div>
                            @if($item->description)
                            <div class="text-xs text-gray-600">{{ $item->description }}</div>
                            @endif
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-center">{{ number_format($item->quantity, 2) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right font-medium">Rp {{ number_format($item->total, 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="bg-gray-50">
                        <td colspan="4" class="border border-gray-300 px-4 py-3 text-right font-semibold">Total Amount</td>
                        <td class="border border-gray-300 px-4 py-3 text-right font-bold text-lg">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Notes -->
        @if($order->notes)
        <div class="mb-8">
            <h2 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Notes</h2>
            <div class="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700">
                {{ $order->notes }}
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="mt-12 pt-8 border-t border-gray-300">
            <div class="grid grid-cols-3 gap-8 text-center">
                <div>
                    <p class="text-sm text-gray-600 mb-12">Prepared By</p>
                    <div class="border-t border-gray-400 pt-2">
                        <p class="text-sm font-medium">_________________</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm text-gray-600 mb-12">Approved By</p>
                    <div class="border-t border-gray-400 pt-2">
                        <p class="text-sm font-medium">_________________</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm text-gray-600 mb-12">Vendor Acknowledgment</p>
                    <div class="border-t border-gray-400 pt-2">
                        <p class="text-sm font-medium">_________________</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center text-xs text-gray-500 mt-8">
            Printed on {{ now()->format('d M Y H:i:s') }}
        </div>
    </div>
</body>
</html>
