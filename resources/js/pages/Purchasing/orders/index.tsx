import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, ChevronRight, XCircle, FileText } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { index, create, show } from '@/routes/purchasing/orders';
import { Card } from '@/components/ui/card';

interface PurchaseOrder {
    id: number;
    document_number: string;
    date: string;
    vendor: {
        id: number;
        name: string;
    };
    warehouse: {
        id: number;
        name: string;
    };
    status: string;
    source?: string;
    total: number;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    orders: {
        data: PurchaseOrder[];
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
        vendor_id?: string;
        per_page?: number;
    };
    filterOptions?: {
        vendors?: Array<{ id: number; name: string }>;
    };
}

export default function Index({ orders, filters = {}, filterOptions }: Props) {
    // Handle missing data gracefully
    if (!orders || !orders.data) {
        return (
            <AppLayout breadcrumbs={[
                { title: 'Purchasing', href: '/purchasing' },
                { title: 'Purchase Orders', href: index.url() }
            ]}>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold text-destructive">Unable to Load Orders</h2>
                        <p className="text-muted-foreground">There was a problem loading the purchase orders data.</p>
                    </div>
                    <Button onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const { data, setData, get } = useForm({
        filter: {
            global: filters?.global || '',
            status: filters?.status || '',
            vendor_id: filters?.vendor_id || '',
        },
        per_page: orders.per_page || 15,
    });

    const handleClearFilters = () => {
        setData('filter', {
            global: '',
            status: '',
            vendor_id: '',
        });
        setData('per_page', 15);
        
        router.get(index.url(), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; className?: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            to_approve: { variant: 'default', label: 'To Approve', className: 'bg-amber-600' },
            open: { variant: 'default', label: 'Open', className: 'bg-green-600' },
            partially_received: { variant: 'default', label: 'Partially Received', className: 'bg-blue-600' },
            closed: { variant: 'outline', label: 'Closed' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };

        const config = variants[status] || { variant: 'secondary', label: status };
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
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
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Orders', href: index.url() }
        ]}>
            <Head title="Purchase Orders" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Purchase Orders"
                    description="Manage your purchase orders and track their status."
                >
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Order
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
                            router.get(index.url(), { filter: newFilter, per_page: data.per_page }, {
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
                                    value="to_approve"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    To Approve
                                </TabsTrigger>
                                <TabsTrigger
                                    value="open"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Open
                                </TabsTrigger>
                                <TabsTrigger
                                    value="partially_received"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Partially Received
                                </TabsTrigger>
                                <TabsTrigger
                                    value="closed"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Closed
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
                                placeholder="Search..."
                                value={data.filter.global}
                                onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get(index.url(), { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }
                                }}
                                className="pl-8 w-full"
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            {filterOptions?.vendors && (
                                <Select
                                    value={data.filter.vendor_id || '_all'}
                                    onValueChange={(value) => {
                                        const newVal = value === '_all' ? '' : value;
                                        const newFilter = { ...data.filter, vendor_id: newVal };
                                        setData('filter', newFilter);
                                        router.get(index.url(), { filter: newFilter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[180px] h-9">
                                        <SelectValue placeholder="Vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All Vendors</SelectItem>
                                        {filterOptions.vendors.map((vendor) => (
                                            <SelectItem key={vendor.id} value={String(vendor.id)}>{vendor.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {(data.filter.global || data.filter.status || data.filter.vendor_id) && (
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
                                <TableHead>Purchase Order</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No purchase orders found. Create your first order to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(show.url(order.id))}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span>{order.document_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.vendor?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">{order.warehouse?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(order.date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {order.source === 'direct' ? (
                                                <Badge variant="default" className="bg-purple-600">
                                                    Direct
                                                </Badge>
                                            ) : order.source === 'rfq' ? (
                                                <Badge variant="default" className="bg-blue-600">
                                                    RFQ
                                                </Badge>
                                            ) : order.source === 'pr' ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    PR
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Manual
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(Number(order.total))}
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
                        links={orders.links}
                        from={orders.from ?? 0}
                        to={orders.to ?? 0}
                        total={orders.total}
                        per_page={data.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            router.get(index.url(), 
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
