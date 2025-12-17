
import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { index, store, getUnpaidBills } from '@/routes/purchasing/payments';
import axios from 'axios';

interface Props {
    vendors: { id: number; name: string }[];
}

interface Allocation {
    bill_id: number;
    bill_number: string;
    amount: number;
    balance_due: number;
    amount_paid: number; // Previous payments
    total: number;
}

export default function Create({ vendors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        vendor_id: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        reference_number: '',
        amount: 0,
        notes: '',
        allocations: [] as Allocation[],
    });

    const [unpaidBills, setUnpaidBills] = useState<any[]>([]);

    useEffect(() => {
        if (data.vendor_id) {
            axios.get(getUnpaidBills.url(Number(data.vendor_id)))
                .then(response => {
                    setUnpaidBills(response.data);
                    // Reset allocations when vendor changes
                    setData('allocations', []);
                });
        }
    }, [data.vendor_id]);

    const handleAutoAllocate = () => {
        let remaining = Number(data.amount);
        const newAllocations: Allocation[] = [];

        // Sort bills by due date? For now just sequential
        unpaidBills.forEach(bill => {
            if (remaining > 0) {
                const allocate = Math.min(bill.balance_due, remaining);
                newAllocations.push({
                    bill_id: bill.id,
                    bill_number: bill.bill_number,
                    amount: allocate,
                    balance_due: bill.balance_due,
                    amount_paid: bill.amount_paid,
                    total: bill.total
                });
                remaining -= allocate;
            }
        });

        setData('allocations', newAllocations);
    };

    const handleAllocationChange = (billId: number, amount: string) => {
        const val = Number(amount);
        const bill = unpaidBills.find(b => b.id === billId);
        if (!bill) return;
        
        const existing = data.allocations.find(a => a.bill_id === billId);
        
        let newAllocations = [...data.allocations];
        if (val > 0) {
            if (existing) {
                existing.amount = val;
            } else {
                newAllocations.push({
                    bill_id: billId,
                    bill_number: bill.bill_number,
                    amount: val,
                    balance_due: bill.balance_due,
                    amount_paid: bill.amount_paid,
                    total: bill.total
                });
            }
        } else {
            newAllocations = newAllocations.filter(a => a.bill_id !== billId);
        }
        setData('allocations', newAllocations);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    const getAllocationForBill = (billId: number) => {
        return data.allocations.find(a => a.bill_id === billId)?.amount || 0;
    };

    const totalAllocated = data.allocations.reduce((sum, a) => sum + a.amount, 0);

    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'Vendor Payments', href: index.url() }, { title: 'Record Payment' }]}>
            <Head title="Record Vendor Payment" />
            <div className="container mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Record Vendor Payment</CardTitle>
                        <CardDescription>Record a payment to a vendor against outstanding bills.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="payment_number">Payment Number</Label>
                                    <Input 
                                        id="payment_number" 
                                        value="Auto-generated"
                                        disabled
                                        className="bg-gray-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Generated automatically upon saving.</p>
                                </div>
                                <div>
                                    <Label htmlFor="vendor_id">Vendor</Label>
                                    <Select 
                                        value={data.vendor_id} 
                                        onValueChange={(val) => setData('vendor_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map(vendor => (
                                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.vendor_id && <div className="text-red-500 text-sm">{errors.vendor_id}</div>}
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
                                    <Label htmlFor="amount">Total Amount</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="amount" 
                                            type="number" 
                                            step="0.01"
                                            value={data.amount} 
                                            onChange={e => setData('amount', parseFloat(e.target.value) || 0)}
                                        />
                                        <Button type="button" variant="outline" onClick={handleAutoAllocate}>
                                            Auto Allocate
                                        </Button>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Allocated: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAllocated)}
                                    </div>
                                    {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
                                    {Math.abs(Number(data.amount || '0') - totalAllocated) > 0.01 && (
                                        <div className="text-red-500 text-sm">Amount must match allocated total.</div>
                                    )}
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
                                        value={data.reference_number} 
                                        onChange={e => setData('reference_number', e.target.value)}
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

                            {/* Unpaid Bills Section */}
                            <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                                <h3 className="text-lg font-medium mb-4">Unpaid Bills</h3>
                                {unpaidBills.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-2">Bill #</th>
                                                    <th className="px-4 py-2">Date</th>
                                                    <th className="px-4 py-2">Due Date</th>
                                                    <th className="px-4 py-2 text-right">Total</th>
                                                    <th className="px-4 py-2 text-right">Paid</th>
                                                    <th className="px-4 py-2 text-right">Balance</th>
                                                    <th className="px-4 py-2 text-right w-32">Allocate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {unpaidBills.map(bill => (
                                                    <tr key={bill.id} className="border-b dark:border-gray-700">
                                                        <td className="px-4 py-2 font-medium">{bill.bill_number}</td>
                                                        <td className="px-4 py-2">{bill.date}</td>
                                                        <td className="px-4 py-2">{bill.due_date}</td>
                                                        <td className="px-4 py-2 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(bill.total_amount)}</td>
                                                        <td className="px-4 py-2 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(bill.amount_paid)}</td>
                                                        <td className="px-4 py-2 text-right font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(bill.balance_due)}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <Input 
                                                                type="number" 
                                                                className="w-32 ml-auto text-right h-8"
                                                                min="0"
                                                                max={bill.balance_due}
                                                                step="0.01"
                                                                value={getAllocationForBill(bill.id) || ''}
                                                                onChange={(e) => handleAllocationChange(bill.id, e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No unpaid bills found for this vendor.</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => history.back()}>Cancel</Button>
                                <Button type="submit" disabled={processing}>Record Payment</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
