
import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreVertical, LayoutGrid, List as ListIcon, FileText, ShoppingCart, Filter } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { index, create, edit, show, destroy } from '@/routes/purchasing/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';

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
        per_page?: number;
    };
}

export default function Index({ orders, filters = {} }: Props) {
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

    const [searchTerm, setSearchTerm] = useState(filters.global || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    
    // Status tabs configuration
    const statusTabs = [
        { value: 'all', label: 'All Orders' },
        { value: 'draft', label: 'Draft' },
        { value: 'rfq_sent', label: 'RFQ Sent' },
        { value: 'to_approve', label: 'To Approve' },
        { value: 'purchase_order', label: 'Open' },
        { value: 'locked', label: 'Locked' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.global || '')) {
                router.get(
                    index.url(),
                    { ...filters, global: searchTerm, page: 1 }, // Reset to page 1 on search
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            index.url(),
            { ...filters, status: value === 'all' ? null : value, page: 1 },
            { preserveState: true, replace: true }
        );
    };
    
    const handlePerPageChange = (perPage: number) => {
        router.get(
            index.url(),
            { ...filters, per_page: perPage, page: 1 },
            { preserveState: true, replace: true }
        );
    };


    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            rfq_sent: { variant: 'default', label: 'RFQ Sent' },
            to_approve: { variant: 'default', label: 'To Approve' },
            purchase_order: { variant: 'default', label: 'Purchase Order' },
            locked: { variant: 'outline', label: 'Locked' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };

        const config = variants[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Orders', href: index.url() }
        ]}>
            <Head title="Purchase Orders" />

            <div className="container mx-auto space-y-6">
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

                <Card>
                    <CardHeader className="pb-3">
                         <div className="flex flex-col md:flex-row justify-between gap-4">
                            {/* Status Tabs */}
                            <Tabs
                                value={statusFilter}
                                onValueChange={handleStatusChange}
                                className="w-full md:w-auto overflow-x-auto"
                            >
                                <TabsList className="h-auto p-1 bg-muted/50">
                                    {statusTabs.map((tab) => (
                                        <TabsTrigger 
                                            key={tab.value} 
                                            value={tab.value}
                                            className="text-xs px-3 py-1.5"
                                        >
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>

                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search orders..."
                                    className="pl-8 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Document #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Warehouse</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No purchase orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.data.map((order) => (
                                        <TableRow key={order.id} className="group hover:bg-muted/40 cursor-pointer" onClick={() => router.visit(show.url(order.id))}>
                                            <TableCell className="font-medium pl-6">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    {order.document_number}
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.vendor?.name}</div>
                                            </TableCell>
                                             <TableCell>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    {order.warehouse?.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(Number(order.total))}
                                            </TableCell>
                                            <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={show.url(order.id)}>
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {order.status === 'draft' && (
                                                            <>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={edit.url(order.id)}>
                                                                        Edit Order
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DeleteConfirmDialog
                                                                    trigger={
                                                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:bg-destructive/10">
                                                                            Delete Order
                                                                        </div>
                                                                    }
                                                                    onConfirm={() => router.delete(destroy.url(order.id))}
                                                                    title="Delete Order"
                                                                    description="Are you sure you want to delete this purchase order?"
                                                                />
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                         <div className="border-t">
                            <DataTablePagination 
                                links={orders.links}
                                from={orders.from ?? 0}
                                to={orders.to ?? 0}
                                total={orders.total}
                                per_page={orders.per_page}
                                onPageChange={(url) => router.visit(url)}
                                onPerPageChange={handlePerPageChange}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
