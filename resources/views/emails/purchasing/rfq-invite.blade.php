<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <p>Dear {{ $vendor->name }},</p>

    <p>We would like to request a quotation for the following items:</p>

    <p><strong>RFQ Title:</strong> {{ $rfq->title }}<br>
    <strong>Deadline:</strong> {{ $rfq->deadline ? \Carbon\Carbon::parse($rfq->deadline)->format('d M Y') : 'N/A' }}</p>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Target Price (Optional)</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rfq->lines as $line)
            <tr>
                <td>{{ $line->product->name }} ({{ $line->product->code }})</td>
                <td>{{ $line->quantity }} {{ $line->uom->name }}</td>
                <td>{{ $line->target_price ? number_format($line->target_price) : '-' }}</td>
                <td>{{ $line->notes }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <p>Please submit your quotation before the deadline.</p>

    <p>Thank you,<br>
    {{ config('app.name') }} Purchasing Team</p>
</body>
</html>
