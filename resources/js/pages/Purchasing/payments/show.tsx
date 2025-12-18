import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    CreditCard,
    Calendar,
    Building2,
    FileText,
    Pencil,
    CheckCircle,
    Wallet,
    Printer
} from 'lucide-react';
import { index, edit as editPayment } from '@/routes/purchasing/payments';
import { show as showBill } from '@/routes/purchasing/bills';

interface PaymentLine {
    id: number;
    amount: number;
    bill: {
        id: number;
        bill_number: string;
        date: string;
        total_amount: number;
    };
}

interface Payment {
    id: number;
    payment_number: string;
    date: string;
    amount: number;
    reference: string;
    payment_method: string;
    notes: string;
    status: string;
    vendor: {
        id: number;
        name: string;
        address: string;
        phone: string;
        email: string;
    };
    lines: PaymentLine[];
}

const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatCurrency = (amount: number | string) => {
    const val = Number(amount);
    if (isNaN(val)) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(val);
};

export default function Show({ payment }: { payment: Payment }) {
    const getStatusInfo = (status: string) => {
        const variants: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
            posted: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Posted', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
        };
        return variants[status] || { className: 'bg-gray-100 text-gray-800', label: status, icon: null };
    };

    const statusInfo = getStatusInfo(payment.status);

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            bank_transfer: 'Bank Transfer',
            cash: 'Cash',
            check: 'Check',
        };
        return labels[method] || method;
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Purchasing', href: '/purchasing' },
                { title: 'Vendor Payments', href: index.url() },
                { title: payment.payment_number, href: '#' },
            ]}
        >
            <Head title={`Payment ${payment.payment_number}`} />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/purchasing/payments/${payment.id}/print`} target="_blank" rel="noopener noreferrer">
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={editPayment.url(payment.id)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Main Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Header Card */}
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-2xl font-bold tracking-tight">{payment.payment_number}</h1>
                                            <Badge variant="outline" className={statusInfo.className}>
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Payment to {payment.vendor.name}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                        <p className="text-3xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Date</p>
                                        <div className="font-medium flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            {formatDate(payment.date)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Method</p>
                                        <div className="font-medium flex items-center gap-2">
                                            <Wallet className="w-3 h-3 text-muted-foreground" />
                                            {getPaymentMethodLabel(payment.payment_method)}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-muted-foreground">Reference</p>
                                        <p className="font-medium">{payment.reference || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Allocations Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Allocation</CardTitle>
                                <CardDescription>Bills paid by this payment</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="pl-6">Bill Number</TableHead>
                                            <TableHead>Bill Date</TableHead>
                                            <TableHead className="text-right">Bill Total</TableHead>
                                            <TableHead className="text-right pr-6">Amount Paid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payment.lines.map((line) => (
                                            <TableRow key={line.id}>
                                                <TableCell className="pl-6">
                                                    <Link href={showBill.url(line.bill.id)} className="text-primary hover:underline font-medium">
                                                        {line.bill.bill_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(line.bill.date)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatCurrency(line.bill.total_amount)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium font-mono pr-6">
                                                    {formatCurrency(line.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {payment.lines.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                    No payment allocations found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            {payment.lines.length > 0 && (
                                <CardFooter className="bg-muted/30 border-t p-6">
                                    <div className="w-full flex flex-col items-end gap-2">
                                        <div className="flex justify-between w-full sm:w-1/2 md:w-1/3 font-bold text-lg">
                                            <span>Total Payment</span>
                                            <span>{formatCurrency(payment.amount)}</span>
                                        </div>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Vendor Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Vendor Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <div className="font-medium">{payment.vendor.name}</div>
                                    <div className="text-muted-foreground">{payment.vendor.address}</div>
                                </div>
                                <Separator />
                                <div className="grid gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium">{payment.vendor.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phone</span>
                                        <span className="font-medium">{payment.vendor.phone}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {payment.notes && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{payment.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
