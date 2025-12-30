<?php

namespace App\Exports\Accounting;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GeneralLedgerExport implements FromView, ShouldAutoSize, WithStyles
{
    public function __construct(
        protected array $ledgerData,
        protected string $startDate,
        protected string $endDate
    ) {}

    public function view(): View
    {
        return view('exports.accounting.general-ledger', [
            'ledgerData' => $this->ledgerData,
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
        ]);
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => ['font' => ['bold' => true, 'size' => 16]],
            // Style the header row
            3 => ['font' => ['bold' => true]],
        ];
    }
}
