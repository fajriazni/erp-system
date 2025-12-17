import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { index, edit as editPayment } from '@/routes/purchasing/payments';
import { show as showBill } from '@/routes/purchasing/bills';

interface PaymentLine {
    id: number;
    amount: number;
    bill: {
        id: number;
        bill_number: string;
        date: string;
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
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(Number(amount));
};

export default function Show({ payment }: { payment: Payment }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'Vendor Payments', href: index.url() }, { title: payment.payment_number }]}>
            <Head title={`Payment ${payment.payment_number}`} />
            
            <div className="container mx-auto">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={index.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Payment Details</h1>
                    <div className="flex gap-2">
                        <Link href={editPayment.url(payment.id)}>
                            <Button variant="outline">Edit</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{payment.payment_number}</CardTitle>
                                        <CardDescription>
                                            To: <span className="font-semibold text-foreground">{payment.vendor?.name}</span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="capitalize">{payment.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Payment Date</div>
                                        <div>{formatDate(payment.date)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Amount</div>
                                        <div className="font-bold text-lg">{formatCurrency(payment.amount)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Method</div>
                                        <div className="capitalize">{payment.payment_method.replace('_', ' ')}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Reference</div>
                                        <div>{payment.reference || '-'}</div>
                                    </div>
                                </div>
                                {payment.notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
                                            <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Allocation</CardTitle>
                                <CardDescription>Bills paid by this payment</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Bill #</th>
                                                <th className="px-4 py-2 font-medium">Bill Date</th>
                                                <th className="px-4 py-2 font-medium text-right">Amount Alloc.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payment.lines.map((line) => (
                                                <tr key={line.id} className="border-t">
                                                    <td className="px-4 py-2">
                                                        <Link href={showBill.url(line.bill.id)} className="text-blue-600 hover:underline">
                                                            {line.bill.bill_number}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-2">{formatDate(line.bill.date)}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(line.amount)}</td>
                                                </tr>
                                            ))}
                                            {payment.lines.length === 0 && (
                                                 <tr>
                                                     <td colSpan={3} className="px-4 py-4 text-center text-gray-500">No allocations found.</td>
                                                 </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                         {/* Sidebar content (e.g. Audit Log or Vendor details) */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
