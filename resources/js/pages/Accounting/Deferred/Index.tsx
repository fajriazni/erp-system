import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Plus, Search, ChevronRight, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface Props {
    schedules: {
        data: any[];
        links: any[];
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    filters: {
        status: string;
    };
}

export default function DeferredIndex({ schedules, filters }: Props) {
    const [status, setStatus] = useState(filters.status || 'active');

    const handleStatusChange = (val: string) => {
        setStatus(val);
        router.get('/accounting/deferred', { status: val }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Deferred / Prepaid', href: '#' }]}>
            <Head title="Deferred Schedules" />
            
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader 
                    title="Deferred Revenue & Expense" 
                    description="Manage amortization schedules for prepaid expenses and unearned revenue."
                >
                     <Button asChild>
                        <Link href="/accounting/deferred/create">
                            <Plus className="mr-2 h-4 w-4" /> New Schedule
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="p-0 gap-0">
                    <Tabs value={status} onValueChange={handleStatusChange} className="w-full">
                        <div className="p-2 border-b flex justify-between items-center bg-transparent">
                            <TabsList className="w-auto justify-start bg-transparent p-0 h-auto">
                                <TabsTrigger value="active" className="data-[state=active]:bg-muted rounded-md px-4 py-2">
                                    Active
                                </TabsTrigger>
                                <TabsTrigger value="draft" className="data-[state=active]:bg-muted rounded-md px-4 py-2">
                                    Draft
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="data-[state=active]:bg-muted rounded-md px-4 py-2">
                                    Completed
                                </TabsTrigger>
                                <TabsTrigger value="all" className="data-[state=active]:bg-muted rounded-md px-4 py-2">
                                    All
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No schedules found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schedules.data.map((item) => (
                                    <TableRow 
                                        key={item.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/accounting/deferred/${item.id}`)}
                                    >
                                        <TableCell className="font-medium">{item.code}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.type === 'revenue' ? 'default' : 'secondary'}>
                                                {item.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(item.start_date), 'MMM yyyy')} - {format(new Date(item.end_date), 'MMM yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="capitalize">{item.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    
                    <DataTablePagination 
                        links={schedules.links}
                        from={schedules.from}
                        to={schedules.to}
                        total={schedules.total}
                        per_page={schedules.per_page}
                        onPageChange={(url) => { if (url) router.get(url, { status }, { preserveState: true }); }}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
