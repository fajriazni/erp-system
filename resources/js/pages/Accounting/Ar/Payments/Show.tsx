import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, CheckCircle, FileText, Router } from 'lucide-react';
import { format } from 'date-fns';
import * as Payment from '@/actions/App/Http/Controllers/Accounting/CustomerPaymentController';
import * as JournalEntry from '@/actions/App/Http/Controllers/Accounting/JournalEntryController';

export default function Show({ payment }: { payment: any }) {
    const { post, processing } = useForm();

    const handlePost = () => {
        if (confirm('Are you sure you want to post this payment? This will update invoice statuses and generate a journal entry.')) {
            post(Payment.post.url(payment.id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Customer Payments', href: Payment.index.url() }, { title: payment.payment_number, href: '#' }]}>
            <Head title={`Payment ${payment.payment_number}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <PageHeader title={`Payment ${payment.payment_number}`}>
                    <div className="flex gap-2">
                         <Button variant="outline" asChild>
                            <Link href={Payment.index.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                            </Link>
                        </Button>
                        {payment.status === 'draft' && (
                             <Button onClick={handlePost} disabled={processing}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Post Payment
                            </Button>
                        )}
                        {payment.status === 'posted' && (
                            <Badge variant="secondary" className="text-md px-4 py-2">Posted</Badge>
                        )}
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Allocated Invoices</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead className="text-right">Allocated Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payment.lines.map((line: any) => (
                                            <TableRow key={line.id}>
                                                <TableCell className="font-medium">{line.invoice?.invoice_number}</TableCell>
                                                <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(line.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="border-t-2 font-bold">
                                            <TableCell>Total</TableCell>
                                            <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                                    <div className="mt-1">
                                         <Badge variant={payment.status === 'posted' ? 'default' : 'secondary'} className="capitalize">
                                            {payment.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Customer</div>
                                    <div className="mt-1 font-medium">{payment.customer?.company_name || payment.customer?.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Date</div>
                                    <div className="mt-1">{format(new Date(payment.date), 'MMM dd, yyyy')}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Method</div>
                                    <div className="mt-1 capitalize">{payment.payment_method.replace('_', ' ')}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Reference</div>
                                    <div className="mt-1">{payment.reference || '-'}</div>
                                </div>
                                {payment.journal_entry_id && (
                                     <div>
                                        <div className="text-sm font-medium text-muted-foreground">Journal Entry</div>
                                        <div className="mt-1">
                                            <Link href={JournalEntry.show.url(payment.journal_entry_id)} className="text-blue-600 hover:underline flex items-center">
                                                <FileText className="h-4 w-4 mr-1" /> View Entry
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
