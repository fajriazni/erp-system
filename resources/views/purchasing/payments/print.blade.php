<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - {{ $payment->payment_number }}</title>
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
            <h1 class="text-3xl font-bold text-gray-800 mb-2">PAYMENT RECEIPT</h1>
            <div class="flex justify-between">
                <div>
                    <p class="text-sm text-gray-600">Payment Number</p>
                    <p class="text-lg font-semibold">{{ $payment->payment_number }}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600">Status</p>
                    <span class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                        {{ ucfirst($payment->status) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Vendor and Payment Info -->
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h2 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Paid To</h2>
                <div class="border-l-4 border-green-500 pl-4">
                    <p class="font-bold text-gray-900">{{ $payment->vendor->name }}</p>
                    <p class="text-sm text-gray-600">{{ $payment->vendor->address }}</p>
                    <p class="text-sm text-gray-600">{{ $payment->vendor->email }}</p>
                    <p class="text-sm text-gray-600">{{ $payment->vendor->phone }}</p>
                </div>
            </div>
            <div>
                <h2 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Payment Details</h2>
                <table class="text-sm w-full">
                    <tr>
                        <td class="text-gray-600 py-1">Date:</td>
                        <td class="font-medium">{{ \Carbon\Carbon::parse($payment->date)->format('d M Y') }}</td>
                    </tr>
                    <tr>
                        <td class="text-gray-600 py-1">Method:</td>
                        <td class="font-medium capitalize">{{ str_replace('_', ' ', $payment->payment_method) }}</td>
                    </tr>
                    @if($payment->reference)
                    <tr>
                        <td class="text-gray-600 py-1">Reference:</td>
                        <td class="font-medium">{{ $payment->reference }}</td>
                    </tr>
                    @endif
                    <tr class="border-t">
                        <td class="text-gray-600 py-2 font-semibold">Total Amount:</td>
                        <td class="font-bold text-lg text-green-600">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Payment Allocation Table -->
        <div class="mb-8">
            <h2 class="text-sm font-semibold text-gray-700 mb-3 uppercase">Payment Allocation</h2>
            <table class="w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">#</th>
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Bill Number</th>
                        <th class="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Bill Date</th>
                        <th class="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Bill Total</th>
                        <th class="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Amount Paid</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($payment->lines as $index => $line)
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 text-sm">{{ $index + 1 }}</td>
                        <td class="border border-gray-300 px-4 py-2 font-medium">{{ $line->bill->bill_number }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-center text-sm">{{ \Carbon\Carbon::parse($line->bill->date)->format('d M Y') }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">Rp {{ number_format($line->bill->total_amount, 0, ',', '.') }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right font-medium">Rp {{ number_format($line->amount, 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="bg-gray-50">
                        <td colspan="4" class="border border-gray-300 px-4 py-3 text-right font-semibold">Total Payment</td>
                        <td class="border border-gray-300 px-4 py-3 text-right font-bold text-lg text-green-600">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Notes -->
        @if($payment->notes)
        <div class="mb-8">
            <h2 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Notes</h2>
            <div class="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700">
                {{ $payment->notes }}
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="mt-12 pt-8 border-t border-gray-300">
            <div class="grid grid-cols-2 gap-8 text-center">
                <div>
                    <p class="text-sm text-gray-600 mb-12">Prepared By</p>
                    <div class="border-t border-gray-400 pt-2">
                        <p class="text-sm font-medium">_________________</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm text-gray-600 mb-12">Received By</p>
                    <div class="border-t border-gray-400 pt-2">
                        <p class="text-sm font-medium">_________________</p>
                        <p class="text-xs text-gray-500 mt-1">({{ $payment->vendor->name }})</p>
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
