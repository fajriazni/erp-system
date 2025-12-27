<?php

namespace App\Exports\Accounting\Reports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TrialBalanceExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $data;
    protected $isComparative;

    public function __construct($data, $isComparative = false)
    {
        $this->data = $data;
        $this->isComparative = $isComparative;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        if ($this->isComparative) {
            return [
                'Account Code',
                'Account Name',
                'Balance (Primary)',
                'Balance (Comparison)',
                'Variance',
                'Variance %'
            ];
        }

        return [
            'Account Code',
            'Account Name',
            'Debit',
            'Credit'
        ];
    }

    public function map($row): array
    {
        if ($this->isComparative) {
            return [
                $row['code'],
                $row['name'],
                $row['balance_1'],
                $row['balance_2'],
                $row['variance'],
                $row['variance_percentage'] . '%'
            ];
        }

        return [
            $row['code'],
            $row['name'],
            $row['debit'], // Raw number, Excel can format
            $row['credit']
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
