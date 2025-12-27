import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import * as Payment from '@/actions/App/Http/Controllers/Accounting/CustomerPaymentController';
import * as Invoice from '@/actions/App/Http/Controllers/Accounting/CustomerInvoiceController';

export default function Create({ customers, openInvoices, prefill }: { customers: any[], openInvoices: any[], prefill?: { customer_id?: string, invoice_id?: string } }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: prefill?.customer_id || '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'bank_transfer',
        reference: '',
        notes: '',
        lines: [] as { invoice_id: number; amount: number }[],
    });

    const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);

    useEffect(() => {
        if (data.customer_id) {
            setFilteredInvoices(openInvoices.filter(inv => inv.customer_id == data.customer_id));
        } else {
            setFilteredInvoices([]);
        }
    }, [data.customer_id, openInvoices]);

    // Auto-allocate if invoice_id is provided in prefill
    useEffect(() => {
        if (prefill?.invoice_id && filteredInvoices.length > 0) {
            const targetInvoice = filteredInvoices.find(inv => inv.id == prefill.invoice_id);
            if (targetInvoice) {
                // Check if already allocated to avoid loop or duplicate logic
                const alreadyAllocated = data.lines.find(l => l.invoice_id === targetInvoice.id);
                if (!alreadyAllocated) {
                    setData(d => ({
                        ...d,
                        amount: String(targetInvoice.total_amount), // Set total payment amount
                        lines: [{ invoice_id: targetInvoice.id, amount: targetInvoice.total_amount }]
                    }));
                }
            }
        }
    }, [prefill?.invoice_id, filteredInvoices]);

    const handleAmountChange = (val: string) => {
        setData('amount', val);
        // Auto-allocate logic could go here
    };

    const handleLineAmountChange = (invoiceId: number, amount: string) => {
        const numAmount = parseFloat(amount) || 0;
        const currentLines = [...data.lines];
        const existingIndex = currentLines.findIndex(l => l.invoice_id === invoiceId);

        if (numAmount > 0) {
            if (existingIndex >= 0) {
                currentLines[existingIndex].amount = numAmount;
            } else {
                currentLines.push({ invoice_id: invoiceId, amount: numAmount });
            }
        } else {
             if (existingIndex >= 0) {
                currentLines.splice(existingIndex, 1);
            }
        }
        setData('lines', currentLines);
    };

    // Calculate total allocated
    const totalAllocated = data.lines.reduce((sum, line) => sum + line.amount, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(Payment.store.url());
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Customer Payments', href: Payment.index.url() }, { title: 'New', href: '#' }]}>
            <Head title="New Payment" />
            <div className="max-w-4xl mx-auto p-4 pt-0">
                <form onSubmit={handleSubmit}>
                    <PageHeader title="New Payment">
                        <div className="flex gap-2">
                             <Button variant="outline" asChild>
                                <Link href={Payment.index.url()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" /> Save Payment
                            </Button>
                        </div>
                    </PageHeader>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Customer</Label>
                                    <Select value={data.customer_id} onValueChange={val => setData('customer_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                </div>
                                <div>
                                    <Label>Amount</Label>
                                    <Input type="number" step="0.01" value={data.amount} onChange={e => handleAmountChange(e.target.value)} />
                                    {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                </div>
                                <div>
                                    <Label>Payment Method</Label>
                                    <Select value={data.payment_method} onValueChange={val => setData('payment_method', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                            <SelectItem value="credit_card">Credit Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Reference</Label>
                                    <Input value={data.reference} onChange={e => setData('reference', e.target.value)} placeholder="e.g. Check #" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Notes</Label>
                                    <Input value={data.notes} onChange={e => setData('notes', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        {data.customer_id && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Allocate to Invoices</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Invoice #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Total Amount</TableHead>
                                                <TableHead className="text-right w-[200px]">Allocation</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredInvoices.map(invoice => {
                                                const allocated = data.lines.find(l => l.invoice_id === invoice.id)?.amount || '';
                                                return (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell>{invoice.invoice_number}</TableCell>
                                                        <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                                                        <TableCell className="text-right">
                                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input 
                                                                type="number" 
                                                                step="0.01" 
                                                                className="text-right" 
                                                                value={allocated} 
                                                                onChange={e => handleLineAmountChange(invoice.id, e.target.value)}
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {filteredInvoices.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground p-4">No open invoices found for this customer.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    <div className="flex justify-end mt-4 text-sm font-medium">
                                        Total Allocated: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAllocated)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data.amount || '0'))}
                                    </div>
                                    {errors.lines && <p className="text-sm text-red-500 mt-2">{errors.lines}</p>}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
