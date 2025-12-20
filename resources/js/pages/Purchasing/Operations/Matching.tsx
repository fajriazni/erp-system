import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
import { Search, ChevronRight, XCircle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface ThreeWayMatch {
    id: number;
    purchase_order: {
        id: number;
        document_number: string;
        vendor: {
            id: number;
            name: string;
        };
    };
    goods_receipt: {
        id: number;
        receipt_number: string;
    } | null;
    vendor_bill: {
        id: number;
        bill_number: string;
    } | null;
    status: string;
    variance_percentage: number;
    amount_variance: number;
    matched_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    matches: {
        data: ThreeWayMatch[];
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
    stats: {
        total_matches: number;
        matched: number;
        partial_match: number;
        mismatch: number;
        pending_approval: number;
    };
    filters?: {
        filter?: {
            global?: string;
            status?: string;
        };
        per_page?: number;
    };
}

export default function Matching({ matches, stats, filters = {} }: Props) {
    const { data, setData, get } = useForm({
        filter: {
            global: filters?.filter?.global || '',
            status: filters?.filter?.status || '',
        },
        per_page: matches.per_page || 15,
    });

    const handleClearFilters = () => {
        setData('filter', {
            global: '',
            status: '',
        });
        setData('per_page', 15);
        
        router.get('/purchasing/matching', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; icon: any; className?: string }> = {
            pending: { variant: 'secondary', label: 'Pending', icon: Clock },
            matched: { variant: 'default', label: 'Matched', icon: CheckCircle2, className: 'bg-green-600' },
            partial_match: { variant: 'default', label: 'Partial Match', icon: AlertCircle, className: 'bg-amber-600' },
            mismatch: { variant: 'destructive', label: 'Mismatch', icon: XCircle },
            approved: { variant: 'default', label: 'Approved', icon: CheckCircle2, className: 'bg-blue-600' },
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
            { title: '3-Way Matching', href: '/purchasing/matching' }
        ]}>
            <Head title="3-Way Matching" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="3-Way Matching"
                    description="Automated matching of Purchase Orders, Goods Receipts, and Vendor Bills."
                />

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Matches</CardDescription>
                            <CardTitle className="text-3xl">{stats.total_matches}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Matched</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.matched}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Partial Match</CardDescription>
                            <CardTitle className="text-3xl text-amber-600">{stats.partial_match}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Mismatch</CardDescription>
                            <CardTitle className="text-3xl text-red-600">{stats.mismatch}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending Approval</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{stats.pending_approval}</CardTitle>
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
                            router.get('/purchasing/matching', { filter: newFilter, per_page: data.per_page }, {
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
                                <TabsTrigger value="matched" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Matched
                                </TabsTrigger>
                                <TabsTrigger value="partial_match" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Partial Match
                                </TabsTrigger>
                                <TabsTrigger value="mismatch" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">
                                    Mismatch
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by PO or Bill..."
                                value={data.filter.global}
                                onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get('/purchasing/matching', { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
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
                                <TableHead>PO Number</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>GR Number</TableHead>
                                <TableHead>Bill Number</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                                <TableHead>Matched Date</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matches.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No matching records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                matches.data.map((match) => (
                                    <TableRow
                                        key={match.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/purchasing/matching/${match.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            {match.purchase_order?.document_number}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{match.purchase_order?.vendor?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {match.goods_receipt?.receipt_number || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {match.vendor_bill?.bill_number || '-'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(match.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {match.variance_percentage > 0 && (
                                                <div className={`font-medium ${match.variance_percentage > 5 ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {match.variance_percentage.toFixed(2)}%
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatCurrency(Number(match.amount_variance))}
                                                    </div>
                                                </div>
                                            )}
                                            {match.variance_percentage === 0 && (
                                                <div className="text-green-600 font-medium">0%</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {match.matched_at ? (
                                                new Date(match.matched_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                            ) : '-'}
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
                        links={matches.links}
                        from={matches.from ?? 0}
                        to={matches.to ?? 0}
                        total={matches.total}
                        per_page={data.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            router.get('/purchasing/matching', 
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
