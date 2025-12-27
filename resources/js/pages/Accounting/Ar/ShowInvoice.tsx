import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ArrowLeft, Edit, FileText, Printer, CheckCircle, Receipt, AlertCircle } from 'lucide-react';
import * as Invoice from '@/actions/App/Http/Controllers/Accounting/CustomerInvoiceController';
import * as JournalEntry from '@/actions/App/Http/Controllers/Accounting/JournalEntryController';
import * as Payment from '@/actions/App/Http/Controllers/Accounting/CustomerPaymentController';

export default function ShowInvoice({ invoice, canPost }: { invoice: any, canPost: boolean }) {
    const { post: postAction, processing } = useForm();

    const handlePost = () => {
        if (confirm('Are you sure you want to post this invoice? This action creates journal entries and cannot be undone (requires credit note).')) {
             postAction(Invoice.post.url(invoice.id));
        }
    };

    // Calculate balance due
    const balanceDue = parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount || 0);
    const isPaid = balanceDue <= 0;
    const isPartiallyPaid = parseFloat(invoice.paid_amount || 0) > 0 && balanceDue > 0;

    // Calculate days overdue
    let daysOverdue = 0;
    if (invoice.due_date && invoice.status === 'posted' && !isPaid) {
        const dueDate = new Date(invoice.due_date);
        const today = new Date();
        daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const isOverdue = daysOverdue > 0;

    // Status badge variant
    const getStatusVariant = () => {
        if (isPaid) return 'default';
        if (isOverdue) return 'destructive';
        if (invoice.status === 'posted') return 'secondary';
        return 'outline';
    };

    const getStatusLabel = () => {
        if (isPaid) return 'Paid';
        if (isOverdue) return 'Overdue';
        if (invoice.status === 'posted') return isPartiallyPaid ? 'Partial' : 'Posted';
        return 'Draft';
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${parseFloat(String(amount)).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Invoices', href: Invoice.index.url() }, { title: invoice.invoice_number, href: '#' }]}>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <PageHeader 
                    title={`Invoice ${invoice.invoice_number}`}
                    description={`Customer: ${invoice.customer?.company_name || invoice.customer?.name}`}
                >
                    <div className="flex gap-2">
                         <Button variant="outline" asChild>
                            <Link href={Invoice.index.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                            </Link>
                        </Button>
                        <Button variant="outline">
                             <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        {invoice.status === 'draft' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={Invoice.edit.url(invoice.id)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </Button>
                                <Button onClick={handlePost} disabled={processing}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Post
                                </Button>
                            </>
                        )}
                        {invoice.status === 'posted' && !isPaid && (
                            <Button asChild>
                                <Link href={`${Payment.create.url()}?customer_id=${invoice.customer_id}&invoice_id=${invoice.id}`}>
                                    <Receipt className="mr-2 h-4 w-4" /> Register Payment
                                </Link>
                            </Button>
                        )}
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Invoice Lines */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Lines</CardTitle>
                                <CardDescription>Items included in this invoice</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.lines.map((line: any, idx: number) => (
                                            <TableRow key={line.id} className={idx % 2 === 0 ? 'bg-muted/50' : ''}>
                                                <TableCell className="font-medium">{line.product?.name || '-'}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{line.description || '-'}</TableCell>
                                                <TableCell className="text-right font-mono">{parseFloat(line.quantity).toLocaleString('id-ID')}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(line.unit_price)}</TableCell>
                                                <TableCell className="text-right font-mono font-medium">{formatCurrency(line.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        
                        {/* Totals Summary */}
                        <div className="flex justify-end">
                            <Card className="w-full sm:w-2/3 lg:w-1/2 shadow-sm">
                                <CardContent className="pt-6">
                                     <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b text-sm">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span className="font-mono">{formatCurrency(invoice.tax_amount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between py-3 text-lg font-bold border-t-2">
                                            <span>Total</span>
                                            <span className="font-mono">{formatCurrency(invoice.total_amount)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Status & Details Card */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Invoice Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Status</div>
                                    <Badge variant={getStatusVariant()} className="text-sm px-3 py-1">
                                        {getStatusLabel()}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Customer</div>
                                    <div className="mt-1 font-medium">{invoice.customer?.company_name || invoice.customer?.name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Invoice Date</div>
                                        <div className="mt-1 text-sm">{new Date(invoice.date).toLocaleDateString('id-ID')}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Due Date</div>
                                        <div className="mt-1 text-sm">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}</div>
                                    </div>
                                </div>
                                 {invoice.journal_entry_id && (
                                     <div>
                                        <div className="text-sm font-medium text-muted-foreground">Journal Entry</div>
                                        <div className="mt-1">
                                            <Link href={JournalEntry.show.url(invoice.journal_entry_id)} className="text-primary hover:underline flex items-center text-sm">
                                                <FileText className="h-4 w-4 mr-1" /> View Entry
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Information Card */}
                        {invoice.status === 'posted' && (
                            <Card className={`shadow-sm ${isOverdue ? 'border-destructive' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Payment Information
                                        {isOverdue && <AlertCircle className="h-5 w-5 text-destructive" />}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Balance Due</div>
                                        <div className={`mt-1 text-2xl font-bold font-mono ${isOverdue ? 'text-destructive' : isPaid ? 'text-green-600' : ''}`}>
                                            {formatCurrency(balanceDue)}
                                        </div>
                                    </div>
                                    {parseFloat(invoice.paid_amount || 0) > 0 && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Amount Paid</div>
                                            <div className="mt-1 font-mono text-green-600">{formatCurrency(invoice.paid_amount)}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Payment Status</div>
                                        <div className="mt-1">
                                            {isPaid ? (
                                                <Badge variant="default">Fully Paid</Badge>
                                            ) : isPartiallyPaid ? (
                                                <Badge variant="secondary">Partially Paid</Badge>
                                            ) : (
                                                <Badge variant="outline">Unpaid</Badge>
                                            )}
                                        </div>
                                    </div>
                                    {isOverdue && (
                                        <div className="pt-3 border-t">
                                            <div className="text-sm font-medium text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
