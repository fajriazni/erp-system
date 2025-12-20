import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ChevronRight, XCircle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface QCInspection {
    id: number;
    goods_receipt_item: {
        id: number;
        goods_receipt: {
            receipt_number: string;
            purchase_order: {
                document_number: string;
                vendor: {
                    name: string;
                };
            };
        };
        product: {
            name: string;
            sku: string;
        };
        quantity_received: number;
    };
    qty_inspected: number;
    qty_passed: number;
    qty_failed: number;
    status: string;
    inspector: {
        name: string;
    } | null;
    inspection_date: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    inspections: {
        data: QCInspection[];
        current_page: number;
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
    };
    stats: {
        pending: number;
        in_progress: number;
        completed: number;
        pass_rate: number;
    };
    filters?: {
        global?: string;
        status?: string;
        per_page?: number;
    };
}

export default function QcIntegration({ inspections, stats, filters = {} }: Props) {
    const { data, setData, get } = useForm({
        filter: {
            global: filters?.global || '',
            status: filters?.status || '',
        },
        per_page: inspections.per_page || 15,
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; icon: any; className?: string }> = {
            pending: { variant: 'secondary', label: 'Pending', icon: Clock },
            in_progress: { variant: 'default', label: 'In Progress', icon: Clock, className: 'bg-blue-600' },
            completed: { variant: 'default', label: 'Completed', icon: CheckCircle2, className: 'bg-green-600' },
        };

        const config = variants[status] || { variant: 'secondary', label: status, icon: Clock };
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className={config.className}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPassRateColor = (passed: number, total: number) => {
        if (total === 0) return 'text-muted-foreground';
        const rate = (passed / total) * 100;
        if (rate >= 95) return 'text-green-600';
        if (rate >= 80) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Operations', href: '/purchasing' },
            { title: 'Quality Control', href: '/purchasing/qc' }
        ]}>
            <Head title="Quality Control" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Quality Control & Inspection"
                    description="Track quality inspections and vendor performance scores."
                />

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending Inspection</CardDescription>
                            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>In Progress</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{stats.in_progress}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Completed</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pass Rate</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.pass_rate.toFixed(1)}%</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className='p-0 gap-0'>
                    <Tabs
                        value={data.filter.status || 'all'}
                        onValueChange={(value) => {
                            const newStatus = value === 'all' ? '' : value;
                            const newFilter = { ...data.filter, status: newStatus };
                            setData('filter', newFilter);
                            router.get('/purchasing/qc', { filter: newFilter, per_page: data.per_page }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        className="w-full"
                    >
                        <div className="p-2 border-b flex justify-between items-center bg-transparent">
                            <TabsList className="w-auto justify-start bg-transparent p-0 h-auto">
                                <TabsTrigger value="all" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    All
                                </TabsTrigger>
                                <TabsTrigger value="pending" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Pending
                                </TabsTrigger>
                                <TabsTrigger value="in_progress" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    In Progress
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Completed
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by GR, product, or vendor..."
                                value={data.filter.global}
                                onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get('/purchasing/qc', { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
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
                                    onClick={() => {
                                        setData('filter', { global: '', status: '' });
                                        router.get('/purchasing/qc', {}, { preserveState: true, preserveScroll: true });
                                    }}
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
                                <TableHead>GR Number</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Qty Received</TableHead>
                                <TableHead>Inspected</TableHead>
                                <TableHead>Pass/Fail</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Inspector</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inspections.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No QC inspections found. Inspections are created from Goods Receipts.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inspections.data.map((inspection) => (
                                    <TableRow
                                        key={inspection.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/purchasing/qc/${inspection.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            {inspection.goods_receipt_item.goods_receipt.receipt_number}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{inspection.goods_receipt_item.product.name}</div>
                                                <div className="text-xs text-muted-foreground">{inspection.goods_receipt_item.product.sku}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{inspection.goods_receipt_item.goods_receipt.purchase_order.vendor.name}</div>
                                        </TableCell>
                                        <TableCell>{inspection.goods_receipt_item.quantity_received}</TableCell>
                                        <TableCell>{inspection.qty_inspected || '-'}</TableCell>
                                        <TableCell>
                                            {inspection.qty_inspected > 0 && (
                                                <div className={`font-medium ${getPassRateColor(inspection.qty_passed, inspection.qty_inspected)}`}>
                                                    {inspection.qty_passed} / {inspection.qty_failed}
                                                    {inspection.qty_failed > 0 && (
                                                        <AlertTriangle className="inline ml-1 h-3 w-3" />
                                                    )}
                                                </div>
                                            )}
                                            {inspection.qty_inspected === 0 && '-'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{inspection.inspector?.name || '-'}</div>
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
                        links={inspections.links}
                        from={inspections.from ?? 0}
                        to={inspections.to ?? 0}
                        total={inspections.total}
                        per_page={data.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            router.get('/purchasing/qc', 
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
