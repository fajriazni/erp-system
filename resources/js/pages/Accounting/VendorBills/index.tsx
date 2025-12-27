import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Plus, Search, XCircle, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { create, show } from '@/routes/accounting/bills';

interface VendorBill {
    id: number;
    bill_number: string;
    reference_number: string;
    vendor: { name: string; company_name: string };
    date: string;
    due_date: string;
    status: string;
    total_amount: number;
    balance_due: number;
}

interface Props {
    bills: {
        data: VendorBill[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function Index({ bills, filters }: Props) {
    const { format } = useCurrency();
    const { data, setData, get } = useForm({
        search: filters?.search || '',
        status: filters?.status || 'all',
        per_page: bills.per_page || 15,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(window.location.pathname, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setData('search', '');
        setData('status', 'all');
        router.get(window.location.pathname, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { className: string; label: string }> = {
            draft: { className: 'bg-gray-100 text-gray-800', label: 'Draft' },
            posted: { className: 'bg-green-100 text-green-800', label: 'Posted' },
            paid: { className: 'bg-blue-100 text-blue-800', label: 'Paid' },
            partial: { className: 'bg-yellow-100 text-yellow-800', label: 'Partially Paid' },
            overdue: { className: 'bg-red-100 text-red-800', label: 'Overdue' },
        };
        const config = variants[status] || { className: 'bg-gray-100 text-gray-800', label: status };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Vendor Bills', href: '#' }]}>
            <Head title="Vendor Bills" />
            
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader 
                    title="Vendor Bills" 
                    description="Manage and track your vendor invoices and payments."
                >
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> New Bill
                        </Link>
                    </Button>
                </PageHeader>

                <Card className='p-0 gap-0'>
                    <Tabs
                        value={data.status}
                        onValueChange={(value) => {
                            setData('status', value);
                            router.get(window.location.pathname, { status: value, search: data.search }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        className="w-full"
                    >
                        <div className="p-2 border-b flex justify-between items-center bg-transparent">
                            <TabsList className="w-auto justify-start bg-transparent p-0 h-auto">
                                <TabsTrigger value="all" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    All Bills
                                </TabsTrigger>
                                <TabsTrigger value="draft" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Draft
                                </TabsTrigger>
                                <TabsTrigger value="posted" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Posted
                                </TabsTrigger>
                                <TabsTrigger value="paid" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Paid
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <div className="p-4 border-b flex justify-between items-center gap-4">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by number or vendor..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch(e);
                                    }}
                                    className="pl-8 w-full"
                                />
                            </div>
                            
                            {(data.search || data.status !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearFilters}
                                    className="h-9 w-9"
                                    title="Clear filters"
                                >
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bill Number</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Balance Due</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            No vendor bills found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bills.data.map((bill) => (
                                        <TableRow 
                                            key={bill.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(show.url(bill.id))}
                                        >
                                            <TableCell className="font-medium text-primary">
                                                {bill.bill_number}
                                            </TableCell>
                                            <TableCell>{bill.vendor?.company_name || bill.vendor?.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{bill.reference_number}</TableCell>
                                            <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{getStatusBadge(bill.status)}</TableCell>
                                            <TableCell className="text-right font-mono">{format(bill.total_amount)}</TableCell>
                                            <TableCell className="text-right font-mono text-red-600 font-medium">
                                                {format(bill.balance_due)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        
                        <DataTablePagination 
                            links={bills.links}
                            from={bills.from}
                            to={bills.to}
                            total={bills.total}
                            per_page={data.per_page}
                            onPerPageChange={(value) => {
                                setData('per_page', value);
                                router.get(window.location.pathname, 
                                    { status: data.status, search: data.search, per_page: value, page: 1 }, 
                                    { preserveState: true, preserveScroll: true }
                                );
                            }}
                            onPageChange={(url) => get(url)}
                        />
                    </Tabs>
                </Card>
            </div>
        </AppLayout>
    );
}
