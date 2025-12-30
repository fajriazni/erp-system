<table>
    <thead>
    <tr>
        <th colspan="7" style="font-weight: bold; font-size: 16px; text-align: center;">General Ledger</th>
    </tr>
    <tr>
        <th colspan="7" style="text-align: center;">{{ $startDate }} - {{ $endDate }}</th>
    </tr>
    <tr>
        <th style="font-weight: bold; width: 15px;">Date</th>
        <th style="font-weight: bold; width: 20px;">Reference</th>
        <th style="font-weight: bold; width: 40px;">Description</th>
        <th style="font-weight: bold; width: 15px;">Debit</th>
        <th style="font-weight: bold; width: 15px;">Credit</th>
        <th style="font-weight: bold; width: 15px;">Balance</th>
    </tr>
    </thead>
    <tbody>
    @foreach($ledgerData as $account)
        <tr>
            <td colspan="6" style="font-weight: bold; background-color: #f0f0f0;">
                {{ $account['account_code'] }} - {{ $account['account_name'] }}
            </td>
        </tr>
        <tr>
            <td colspan="5" style="text-align: right; font-style: italic;">Beginning Balance:</td>
            <td style="font-weight: bold;">{{ number_format($account['beginning_balance'], 2) }}</td>
        </tr>
        @foreach($account['movements'] as $line)
            <tr>
                <td>{{ \Carbon\Carbon::parse($line['date'])->format('d/m/Y') }}</td>
                <td>{{ $line['reference_number'] ?? '-' }}</td>
                <td>{{ $line['description'] }}</td>
                <td>{{ $line['debit'] > 0 ? number_format($line['debit'], 2) : '' }}</td>
                <td>{{ $line['credit'] > 0 ? number_format($line['credit'], 2) : '' }}</td>
                <td>{{ number_format($line['balance'], 2) }}</td>
            </tr>
        @endforeach
        <tr>
            <td colspan="5" style="text-align: right; font-weight: bold;">Ending Balance:</td>
            <td style="font-weight: bold;">{{ number_format($account['ending_balance'], 2) }}</td>
        </tr>
        <tr><td colspan="6"></td></tr>
    @endforeach
    </tbody>
</table>
