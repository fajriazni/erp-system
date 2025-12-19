<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; -webkit-text-size-adjust: none; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; color: #4a5568; line-height: 1.6; }
        .info-box { background-color: #f7fafc; border-left: 4px solid #3182ce; padding: 15px; margin-bottom: 25px; border-radius: 4px; }
        .info-item { margin-bottom: 5px; }
        .info-label { font-weight: 600; color: #2d3748; min-width: 100px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; font-size: 14px; }
        th { background-color: #edf2f7; color: #4a5568; font-weight: 600; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #2d3748; }
        tr:last-child td { border-bottom: none; }
        .btn-container { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background-color: #3182ce; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
        .btn:hover { background-color: #2c5282; }
        .footer { background-color: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .product-code { color: #718096; font-size: 12px; display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Request for Quotation</h1>
        </div>
        <div class="content">
            <p>Dear {{ $vendor->name }},</p>
            <p>We are interested in procuring the following items and would like to invite you to submit a quotation.</p>
            
            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">RFQ Ref:</span> {{ $rfq->document_number ?? $rfq->id }}
                </div>
                <div class="info-item">
                    <span class="info-label">Title:</span> {{ $rfq->title }}
                </div>
                <div class="info-item">
                    <span class="info-label">Deadline:</span> {{ $rfq->deadline ? \Carbon\Carbon::parse($rfq->deadline)->format('d M Y') : 'ASAP' }}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="40%">Item</th>
                        <th width="20%">Qty</th>
                        <th width="40%">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($rfq->lines as $line)
                    <tr>
                        <td>
                            <strong>{{ $line->product->name }}</strong>
                            <span class="product-code">{{ $line->product->code }}</span>
                        </td>
                        <td>{{ $line->quantity }} {{ $line->uom->symbol ?? $line->uom->name ?? '' }}</td>
                        <td>{{ $line->notes ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <p>Please provide your best pricing and availability details by the stated deadline.</p>

            <div class="btn-container">
                <a href="mailto:{{ config('mail.from.address') }}?subject=Quotation for RFQ {{ $rfq->document_number }}&body=Please find our quotation attached." class="btn">Reply with Quotation</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            <p>Purchase Department</p>
        </div>
    </div>
</body>
</html>
