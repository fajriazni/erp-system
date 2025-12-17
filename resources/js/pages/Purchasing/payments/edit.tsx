
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { index, update, show } from '@/routes/purchasing/payments';
import { Link } from '@inertiajs/react';

interface Props {
    payment: {
        id: number;
        payment_number: string;
        date: string;
        amount: number;
        reference: string;
        payment_method: string;
        notes: string;
        vendor_id: number;
        vendor: {
            id: number;
            name: string;
        };
        lines: {
            id: number;
            amount: number;
            bill: {
                id: number;
                bill_number: string;
                date: string;
            };
        }[];
    };
    vendors: { id: number; name: string }[];
}

export default function Edit({ payment, vendors }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        date: payment.date.split('T')[0],
        payment_method: payment.payment_method,
        reference: payment.reference || '',
        notes: payment.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url(payment.id));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(Number(amount));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendor Payments', href: index.url() },
            { title: payment.payment_number, href: show.url(payment.id) },
            { title: 'Edit' }
        ]}>
            <Head title={`Edit Payment ${payment.payment_number}`} />
            <div className="container mx-auto">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Payment {payment.payment_number}</CardTitle>
                        <CardDescription>Update payment details. Financial amounts cannot be changed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Payment Number</Label>
                                    <Input value={payment.payment_number} disabled className="bg-gray-100" />
                                </div>
                                <div>
                                    <Label>Vendor</Label>
                                    <Input value={payment.vendor.name} disabled className="bg-gray-100" />
                                </div>
                                <div>
                                    <Label htmlFor="date">Date</Label>
                                    <Input 
                                        id="date" 
                                        type="date"
                                        value={data.date} 
                                        onChange={e => setData('date', e.target.value)}
                                    />
                                     {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
                                </div>
                                <div>
                                    <Label>Total Amount</Label>
                                    <Input value={formatCurrency(payment.amount)} disabled className="bg-gray-100 font-bold" />
                                </div>
                                <div>
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <Select 
                                        value={data.payment_method} 
                                        onValueChange={(val) => setData('payment_method', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="reference">Reference Check/Trx #</Label>
                                    <Input 
                                        id="reference" 
                                        value={data.reference} 
                                        onChange={e => setData('reference', e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea 
                                    id="notes" 
                                    value={data.notes} 
                                    onChange={e => setData('notes', e.target.value)}
                                />
                            </div>

                            {/* Allocations Read-Only */}
                            <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                                <h3 className="text-lg font-medium mb-4">Allocations (Read Only)</h3>
                                <div className="overflow-x-auto">
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
                                                    <td className="px-4 py-2">{line.bill.bill_number}</td>
                                                    <td className="px-4 py-2">{new Date(line.bill.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(line.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => history.back()}>Cancel</Button>
                                <Button type="submit" disabled={processing}>Update Payment</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
