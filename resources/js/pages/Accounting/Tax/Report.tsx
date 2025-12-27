import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Calendar, Download, Send, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface Props {
    periods: {
        data: TaxPeriod[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    filters?: {
        status?: string;
        year?: number;
    };
    availableYears: number[];
}

export default function TaxReport({ periods, filters, availableYears }: Props) {
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

    const filterForm = useForm({
        status: filters?.status || '',
        year: filters?.year || new Date().getFullYear(),
    });

    const generateForm = useForm({
        period: '',
    });

    const handleFilter = () => {
        router.get('/accounting/tax/periods', {
            status: filterForm.data.status,
            year: filterForm.data.year,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        generateForm.post('/accounting/tax/generate', {
            onSuccess: () => {
                setGenerateDialogOpen(false);
                generateForm.reset();
            },
        });
    };

    const handleViewDetails = (period: string) => {
        router.visit(`/accounting/tax/periods/${period}`);
    };

    const handleExport = (period: string, format: 'csv' | 'pdf') => {
        window.location.href = `/accounting/tax/periods/${period}/export/${format}`;
    };

    const getStatusBadge = (status: string) => {
        if (status === 'submitted') {
            return <Badge variant="default">Submitted</Badge>;
        }
        return <Badge variant="secondary">Draft</Badge>;
    };

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
            { title: 'Tax', href: '/accounting/tax' },
            { title: 'SPT Masa PPN', href: '#' }
        ]}>
            <Head title="Tax Reports - SPT Masa PPN" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Tax Reports (SPT Masa PPN)"
                    description="Generate and manage monthly VAT tax reports for SPT Masa PPN submission."
                >
                    <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Generate Report
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleGenerate}>
                                <DialogHeader>
                                    <DialogTitle>Generate Tax Report</DialogTitle>
                                    <DialogDescription>
                                        Select the period to generate or regenerate the tax report.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div>
                                        <Label htmlFor="period">Tax Period</Label>
                                        <Input
                                            id="period"
                                            type="month"
                                            value={generateForm.data.period}
                                            onChange={(e) => generateForm.setData('period', e.target.value)}
                                            placeholder="YYYY-MM"
                                            required
                                        />
                                        {generateForm.errors.period && (
                                            <p className="text-sm text-destructive mt-1">{generateForm.errors.period}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Select month and year (e.g., January 2025)
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setGenerateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={generateForm.processing}>
                                        {generateForm.processing ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            'Generate Report'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </PageHeader>

                <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                        Tax reports calculate PPN Input (from vendor bills) and PPN Output (from customer invoices) for monthly SPT submission.
                    </AlertDescription>
                </Alert>

                <Card className="p-0 gap-0">
                    <Tabs
                        value={filterForm.data.status || 'all'}
                        onValueChange={(value) => {
                            const newStatus = value === 'all' ? '' : value;
                            filterForm.setData('status', newStatus);
                            router.get('/accounting/tax/periods', {
                                status: newStatus,
                                year: filterForm.data.year,
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        className="w-full"
                    >
                        <div className="p-2 border-b flex justify-between items-center bg-transparent">
                            <TabsList className="w-auto justify-start bg-transparent p-0 h-auto">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    All Statuses
                                </TabsTrigger>
                                <TabsTrigger
                                    value="draft"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Draft
                                </TabsTrigger>
                                <TabsTrigger
                                    value="submitted"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Submitted
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2">
                                <Select
                                    value={filterForm.data.year.toString()}
                                    onValueChange={(value) => {
                                        const newYear = parseInt(value);
                                        filterForm.setData('year', newYear);
                                        router.get('/accounting/tax/periods', {
                                            status: filterForm.data.status,
                                            year: newYear,
                                        }, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Tabs>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead className="text-right">PPN Input</TableHead>
                                <TableHead className="text-right">PPN Output</TableHead>
                                <TableHead className="text-right">Net Tax</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periods.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No tax reports found. Click "Generate Report" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                periods.data.map((period) => (
                                    <TableRow 
                                        key={period.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleViewDetails(period.period)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {period.period}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(period.start_date), 'PP')} - {format(new Date(period.end_date), 'PP')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatCurrency(period.input_tax)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatCurrency(period.output_tax)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {period.is_payable && (
                                                    <TrendingUp className="h-4 w-4 text-red-500" />
                                                )}
                                                {period.is_claimable && (
                                                    <TrendingDown className="h-4 w-4 text-green-500" />
                                                )}
                                                <span className={period.is_payable ? 'text-red-600 font-semibold' : period.is_claimable ? 'text-green-600 font-semibold' : ''}>
                                                    {formatCurrency(Math.abs(period.net_tax))}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground text-right">
                                                {period.is_payable ? 'Payable' : period.is_claimable ? 'Claimable' : 'Balanced'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(period.status)}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleExport(period.period, 'csv')}
                                                >
                                                    <Download className="h-3 w-3 mr-1" /> CSV
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <DataTablePagination
                        links={periods.links}
                        from={periods.from}
                        to={periods.to}
                        total={periods.total}
                        per_page={periods.per_page}
                        onPerPageChange={() => {}}
                        onPageChange={(url) => {
                            if (url) router.get(url);
                        }}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
