import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, ChevronRight, XCircle, Package } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Card } from '@/components/ui/card';

interface GoodsReceipt {
    id: number;
    receipt_number: string;
    date: string;
    purchase_order: {
        id: number;
        document_number: string;
        vendor: {
            id: number;
            name: string;
        };
    };
    warehouse: {
        id: number;
        name: string;
    };
    status: string;
    received_by?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    receipts?: {
        data: GoodsReceipt[];
        current_page: number;
        first_page_url: string | null;
        from: number | null;
        last_page: number;
        last_page_url: string | null;
        links: PaginationLink[];
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number | null;
        total: number;
    };
    filters?: {
        global?: string;
        status?: string;
        per_page?: number;
    };
}

export default function Index({ receipts, filters = {} }: Props) {
    const { data, setData, get } = useForm({
        filter: {
            global: filters?.global || '',
            status: filters?.status || '',
        },
        per_page: receipts?.per_page || 15,
    });

    const handleClearFilters = () => {
        setData('filter', {
            global: '',
            status: '',
        });
        setData('per_page', 15);
        
        router.get('/purchasing/receipts', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; className?: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            received: { variant: 'default', label: 'Received', className: 'bg-blue-600' },
            posted: { variant: 'default', label: 'Posted', className: 'bg-green-600' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };

        const config = variants[status] || { variant: 'secondary', label: status };
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Goods Receipts', href: '/purchasing/receipts' }
        ]}>
            <Head title="Goods Receipts" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Goods Receipts"
                    description="Track and manage received goods from purchase orders."
                >
                    <Button asChild>
                        <Link href="/purchasing/receipts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Receipt
                        </Link>
                    </Button>
                </PageHeader>

                <Card className='p-0 gap-0'>
                    <Tabs
                        value={data.filter.status || 'all'}
                        onValueChange={(value) => {
                            const newStatus = value === 'all' ? '' : value;
                            const newFilter = { ...data.filter, status: newStatus };
                            setData('filter', newFilter);
                            router.get('/purchasing/receipts', { filter: newFilter, per_page: data.per_page }, {
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
                                    value="received"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Received
                                </TabsTrigger>
                                <TabsTrigger
                                    value="posted"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Posted
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cancelled"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Cancelled
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by receipt number or PO..."
                                value={data.filter.global}
                                onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get('/purchasing/receipts', { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }
                                }}
                                className="pl-8 w-full"
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            {(data.filter.global || data.filter.status) && (
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
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Receipt Number</TableHead>
                                <TableHead>Purchase Order</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!receipts?.data || receipts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No goods receipts found. Create a receipt from a purchase order to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                receipts.data.map((receipt) => (
                                    <TableRow
                                        key={receipt.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/purchasing/receipts/${receipt.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span>{receipt.receipt_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{receipt.purchase_order?.document_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">{receipt.purchase_order?.vendor?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">{receipt.warehouse?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(receipt.date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <DataTablePagination 
                        links={receipts?.links || []}
                        from={receipts?.from ?? 0}
                        to={receipts?.to ?? 0}
                        total={receipts?.total ?? 0}
                        per_page={data.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            router.get('/purchasing/receipts', 
                                { filter: data.filter, per_page: value, page: 1 }, 
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                        onPageChange={(url) => {
                            get(url);
                        }}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
