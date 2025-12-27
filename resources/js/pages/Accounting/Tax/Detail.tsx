import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Send } from 'lucide-react';
import { format } from 'date-fns';

interface TaxPeriod {
    id: number;
    period: string;
    start_date: string;
    end_date: string;
    input_tax: number;
    output_tax: number;
    net_tax: number;
    status: 'draft' | 'submitted';
    submitted_at?: string;
    submitted_by?: {
        id: number;
        name: string;
    };
    is_payable: boolean;
    is_claimable: boolean;
}

interface Transaction {
    date: string;
    reference: string;
    partner: string;
    base_amount: number;
    tax_rate: number;
    tax_amount: number;
}

interface Props {
    taxPeriod: TaxPeriod;
    inputTransactions: Transaction[];
    outputTransactions: Transaction[];
    summary: {
        total_input_tax: number;
        total_output_tax: number;
        net_tax: number;
    };
}

export default function TaxReportDetail({ taxPeriod, inputTransactions, outputTransactions, summary }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Accounting', href: '/accounting' },
            { title: 'Tax Reports', href: '/accounting/tax/periods' },
            { title: taxPeriod.period, href: '#' }
        ]}>
            <Head title={`Tax Report - ${taxPeriod.period}`} />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title={`Tax Report - ${taxPeriod.period}`}
                    description={`Period: ${format(new Date(taxPeriod.start_date), 'PP')} - ${format(new Date(taxPeriod.end_date), 'PP')}`}
                >
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/accounting/tax/periods">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/accounting/tax/periods/${taxPeriod.period}/export/csv`}>
                                <Download className="mr-2 h-4 w-4" /> Export CSV
                            </a>
                        </Button>
                    </div>
                </PageHeader>

                {/* Summary Card */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">PPN Input (Masukan)</p>
                            <p className="text-2xl font-bold">{formatCurrency(taxPeriod.input_tax)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">PPN Output (Keluaran)</p>
                            <p className="text-2xl font-bold">{formatCurrency(taxPeriod.output_tax)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Net Tax</p>
                            <p className={`text-2xl font-bold ${taxPeriod.is_payable ? 'text-red-600' : taxPeriod.is_claimable ? 'text-green-600' : ''}`}>
                                {formatCurrency(Math.abs(taxPeriod.net_tax))}
                            </p>
                            <Badge variant={taxPeriod.is_payable ? 'destructive' : 'default'}>
                                {taxPeriod.is_payable ? 'Payable' : taxPeriod.is_claimable ? 'Claimable' : 'Balanced'}
                            </Badge>
                        </div>
                    </div>
                </Card>

                {/* Input Transactions */}
                <Card className="p-0">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">PPN Input (From Vendor Bills)</h3>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead className="text-right">Base Amount</TableHead>
                                <TableHead className="text-right">Tax Rate</TableHead>
                                <TableHead className="text-right">Tax Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inputTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No input transactions in this period
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inputTransactions.map((transaction, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{format(new Date(transaction.date), 'PP')}</TableCell>
                                        <TableCell className="font-medium">{transaction.reference}</TableCell>
                                        <TableCell>{transaction.partner}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(transaction.base_amount)}</TableCell>
                                        <TableCell className="text-right">{transaction.tax_rate}%</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(transaction.tax_amount)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Output Transactions */}
                <Card className="p-0">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">PPN Output (From Customer Invoices)</h3>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Base Amount</TableHead>
                                <TableHead className="text-right">Tax Rate</TableHead>
                                <TableHead className="text-right">Tax Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {outputTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No output transactions in this period
                                    </TableCell>
                                </TableRow>
                            ) : (
                                outputTransactions.map((transaction, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{format(new Date(transaction.date), 'PP')}</TableCell>
                                        <TableCell className="font-medium">{transaction.reference}</TableCell>
                                        <TableCell>{transaction.partner}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(transaction.base_amount)}</TableCell>
                                        <TableCell className="text-right">{transaction.tax_rate}%</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(transaction.tax_amount)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
