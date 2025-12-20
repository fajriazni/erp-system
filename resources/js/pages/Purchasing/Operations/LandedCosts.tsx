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
import { Search, ChevronRight, XCircle, DollarSign, Package } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface LandedCost {
    id: number;
    goods_receipt: {
        id: number;
        receipt_number: string;
        purchase_order: {
            document_number: string;
            vendor: {
                name: string;
            };
        };
    };
    cost_type: string;
    description: string;
    amount: number;
    allocation_method: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    landed_costs: {
        data: LandedCost[];
        current_page: number;
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
    };
    stats: {
        total_costs: number;
        total_amount: number;
        this_month: number;
    };
    filters?: {
        global?: string;
        cost_type?: string;
        per_page?: number;
    };
}

export default function LandedCosts({ landed_costs, stats, filters = {} }: Props) {
    const { data, setData, get } = useForm({
        filter: {
            global: filters?.global || '',
            cost_type: filters?.cost_type || '',
        },
        per_page: landed_costs.per_page || 15,
    });

    const getCostTypeBadge = (type: string) => {
        const variants: Record<string, { variant: any; label: string; className?: string }> = {
            freight: { variant: 'default', label: 'Freight', className: 'bg-blue-600' },
            insurance: { variant: 'default', label: 'Insurance', className: 'bg-green-600' },
            customs: { variant: 'default', label: 'Customs', className: 'bg-purple-600' },
            handling: { variant: 'default', label: 'Handling', className: 'bg-amber-600' },
            other: { variant: 'secondary', label: 'Other' },
        };

        const config = variants[type] || { variant: 'secondary', label: type };
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
            { title: 'Operations', href: '/purchasing' },
            { title: 'Landed Costs', href: '/purchasing/landed-costs' }
        ]}>
            <Head title="Landed Costs Management" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Landed Costs Management"
                    description="Track and manage additional costs like freight, insurance, and customs duties."
                />

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Landed Costs</CardDescription>
                            <CardTitle className="text-3xl">{stats.total_costs}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Amount</CardDescription>
                            <CardTitle className="text-3xl text-green-600">
                                {formatCurrency(stats.total_amount)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>This Month</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">
                                {formatCurrency(stats.this_month)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className='p-0 gap-0'>
                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by receipt or description..."
                                value={data.filter.global}
                                onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get('/purchasing/landed-costs', { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }
                                }}
                                className="pl-8 w-full"
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            {(data.filter.global || data.filter.cost_type) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setData('filter', { global: '', cost_type: '' });
                                        router.get('/purchasing/landed-costs', {}, { preserveState: true, preserveScroll: true });
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
                                <TableHead>Vendor</TableHead>
                                <TableHead>Cost Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Allocation Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {landed_costs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No landed costs found. Costs are added to Goods Receipts.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                landed_costs.data.map((cost) => (
                                    <TableRow
                                        key={cost.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/purchasing/receipts/${cost.goods_receipt.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span>{cost.goods_receipt.receipt_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{cost.goods_receipt.purchase_order.vendor.name}</div>
                                        </TableCell>
                                        <TableCell>{getCostTypeBadge(cost.cost_type)}</TableCell>
                                        <TableCell>{cost.description}</TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {cost.allocation_method.replace('by_', '').replace('_', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            <div className="flex items-center justify-end gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {formatCurrency(Number(cost.amount))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(cost.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
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
                        links={landed_costs.links}
                        from={landed_costs.from ?? 0}
                        to={landed_costs.to ?? 0}
                        total={landed_costs.total}
                        per_page={data.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            router.get('/purchasing/landed-costs', 
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
