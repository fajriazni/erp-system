import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { index, post, show } from '@/routes/purchasing/bills';
import MatchStatusBadge from './components/MatchStatusBadge';

interface MatchException {
    type: string;
    product_id?: number;
    product_name?: string;
    message: string;
}

interface Props {
    bill: {
        id: number;
        bill_number: string;
        reference_number: string;
        date: string;
        due_date: string;
        status: string;
        match_status?: string;
        match_exceptions?: MatchException[];
        vendor: {
            name: string;
            email: string;
            phone: string;
            address: string;
        };
        items: {
            id: number;
            product: {
                name: string;
                sku: string;
            };
            description: string;
            quantity: number;
            unit_price: number;
            total: number;
        }[];
        total_amount: number;
        notes: string;
    };
}

export default function Show({ bill }: Props) {
    const { post: postForm, processing } = useForm();

    const handlePost = () => {
        if (confirm('Are you sure you want to post this bill? This action cannot be undone.')) {
            postForm(post.url(bill.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            posted: { variant: 'default', label: 'Posted' },
            paid: { variant: 'outline', label: 'Paid' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };
        const config = variants[status] || { variant: 'outline', label: status };
        return <Badge variant={config.variant} className={status === 'paid' ? 'text-green-600 border-green-600' : ''}>{config.label}</Badge>;
    };

    const formatCurrency = (amount: number | string) => {
        const val = Number(amount);
        if (isNaN(val)) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
    };

    const formatDate = (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Purchasing', href: '/purchasing' },
                { title: 'Vendor Bills', href: index.url() },
                { title: bill.bill_number, href: '#' },
            ]}
        >
            <Head title={`Bill ${bill.bill_number}`} />

            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={index.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendor Bills
                    </Link>
                </Button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{bill.bill_number}</h1>
                        <p className="text-muted-foreground">Reference: {bill.reference_number}</p>
                    </div>
                    <div className="flex gap-2">
                        {bill.status === 'draft' && (
                            <Button onClick={handlePost} disabled={processing}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Post Bill
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                 {/* Left column - Bill details (spans 2 cols on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Bill Information</CardTitle>
                                <div className="flex gap-2">
                                    {getStatusBadge(bill.status)}
                                    {bill.status === 'posted' && bill.match_status && (
                                        <MatchStatusBadge status={bill.match_status} exceptions={bill.match_exceptions} />
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                             <div>
                                <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                                <p className="mt-1 font-medium">{bill.vendor.name}</p>
                                <p className="text-sm text-muted-foreground">{bill.vendor.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Reference</p>
                                <p className="mt-1 font-medium">{bill.reference_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Bill Date</p>
                                <p className="mt-1">{formatDate(bill.date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                                <p className="mt-1">{formatDate(bill.due_date)}</p>
                            </div>
                            {bill.notes && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm">{bill.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                            <CardDescription>{bill.items.length} item(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bill.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.product.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.unit_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             <div className="flex justify-end pt-4 border-t mt-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                    <p className="text-2xl font-bold">{formatCurrency(bill.total_amount)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                 {/* Right column - Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Match Exceptions Card */}
                    {bill.match_status === 'exception' && bill.match_exceptions && bill.match_exceptions.length > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-700 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Match Exceptions
                                </CardTitle>
                                <CardDescription className="text-red-600">
                                    Review the following discrepancies
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {bill.match_exceptions.map((exc, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded border border-red-200">
                                        <p className="text-sm font-medium text-red-800">{exc.product_name || exc.type}</p>
                                        <p className="text-sm text-red-600">{exc.message}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
