import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ... (imports remain the same, ensuring Tabs is imported and Select/Filter might be removed if unused, but I will keep them for now just in case other filters are added later or if I miss something, but the instruction is to replace)
import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, FileText, Calendar, Clock, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { create, show, index } from '@/routes/purchasing/rfqs';
import { PageHeader } from '@/components/ui/page-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface RfqIndexProps {
    rfqs: {
        data: any[];
        links: any[];
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters?: {
        search?: string;
        status?: string;
    }
}

export default function RfqIndex({ rfqs, filters: initialFilters = {} }: RfqIndexProps) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (initialFilters.search || '')) {
                router.get(index.url(), { 
                    search: search || undefined, 
                    filter: { status: statusFilter === 'all' ? undefined : statusFilter } 
                }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(index.url(), { 
            search: search || undefined, 
            filter: { status: value === 'all' ? undefined : value } 
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        router.get(index.url(), {}, { preserveState: true, replace: true });
    };
    
    const handlePerPageChange = (perPage: number) => {
         router.get(index.url(), { 
            per_page: perPage,
            search: search || undefined, 
            filter: { status: statusFilter === 'all' ? undefined : statusFilter }
        }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'RFQs' }]}>
            <Head title="Requests for Quotation" />
            
            <PageHeader 
                title="Requests for Quotation" 
                description="Manage your tender processes and vendor bids."
            >
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Create RFQ
                    </Link>
                </Button>
            </PageHeader>

            <div className="container mx-auto space-y-6 max-w-full">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open RFQs</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rfqs.data ? rfqs.data.filter((r: any) => r.status === 'open').length : 0}</div> 
                            <p className="text-xs text-muted-foreground">Active on this page</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-bold">{rfqs.data ? rfqs.data.filter((r: any) => r.status === 'draft').length : 0}</div>
                            <p className="text-xs text-muted-foreground">Drafts on this page</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rfqs.total}</div>
                            <p className="text-xs text-muted-foreground">Total records</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="p-0 gap-0">
                    <Tabs
                        value={statusFilter}
                        onValueChange={handleStatusChange}
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
                                    value="open"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Open
                                </TabsTrigger>
                                <TabsTrigger
                                    value="closed"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Closed
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="p-4 border-b flex justify-between items-center gap-4">
                         <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search RFQs..."
                                className="pl-8 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {(search || statusFilter !== 'all') && (
                                <Button variant="ghost" size="icon" onClick={clearFilters}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Document #</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rfqs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No RFQs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rfqs.data.map((rfq: any) => (
                                    <TableRow 
                                        key={rfq.id} 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(show.url(rfq.id))}
                                    >
                                        <TableCell className="font-medium">
                                            {rfq.document_number}
                                        </TableCell>
                                        <TableCell>{rfq.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={rfq.status === 'open' ? 'default' : (rfq.status === 'draft' ? 'secondary' : 'outline')}>
                                                {rfq.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{rfq.user?.name || 'Unknown'}</TableCell>
                                        <TableCell>{format(new Date(rfq.deadline), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    
                    <DataTablePagination 
                        links={rfqs.links}
                        from={rfqs.from}
                        to={rfqs.to}
                        total={rfqs.total}
                        per_page={rfqs.per_page}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(url) => router.visit(url)}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
