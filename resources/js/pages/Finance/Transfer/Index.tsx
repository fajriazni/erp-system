
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, ArrowRight, Loader2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function TransferIndex({ transfers, accounts }: { transfers: any, accounts: any[] }) {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Fund Transfers', href: '/finance/transfers' }
        ]}>
            <Head title="Fund Transfers" />

            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Fund Transfers</h1>
                        <p className="text-muted-foreground">Manage internal transfers between bank accounts and cash drawers.</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Transfer
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>From Account</TableHead>
                                <TableHead>To Account</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transfers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No transfers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transfers.data.map((transfer: any) => (
                                    <TableRow key={transfer.id}>
                                        <TableCell>{formatDate(transfer.transaction_date)}</TableCell>
                                        <TableCell className="font-mono text-xs">{transfer.reference}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">{transfer.bank_account.name}</Badge>
                                            </div>
                                        </TableCell>
                                         <TableCell>
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline" className="text-xs">
                                                    {transfer.related_transaction?.bank_account?.name || 'Unknown'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={transfer.description}>
                                            {transfer.description}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(Number(transfer.amount), transfer.bank_account.currency)}
                                        </TableCell>
                                         <TableCell className="text-center">
                                            <Badge variant="secondary" className="capitalize">{transfer.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                 {/* Pagination could go here */}
            </div>

            <TransferModal 
                open={createOpen} 
                onOpenChange={setCreateOpen} 
                accounts={accounts} 
            />
        </AppLayout>
    );
}

function TransferModal({ open, onOpenChange, accounts }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.transfer.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            }
        });
    };

    const fromAccount = accounts.find((a: any) => String(a.id) === data.from_account_id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transfer Funds</DialogTitle>
                    <DialogDescription>Move money between your accounts.</DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>From Account</Label>
                            <Select 
                                value={data.from_account_id}
                                onValueChange={(val) => setData('from_account_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((acc: any) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name} ({acc.currency})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fromAccount && (
                                <p className="text-[10px] text-muted-foreground">
                                    Current Balance: {formatCurrency(fromAccount.current_balance, fromAccount.currency)}
                                </p>
                            )}
                            {errors.from_account_id && <p className="text-xs text-red-500">{errors.from_account_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>To Account</Label>
                            <Select 
                                value={data.to_account_id}
                                onValueChange={(val) => setData('to_account_id', val)}
                                disabled={!data.from_account_id}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Destination" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts
                                        .filter((acc: any) => String(acc.id) !== data.from_account_id) // Exclude source
                                        .filter((acc: any) => !fromAccount || acc.currency === fromAccount.currency) // Filter currency match
                                        .map((acc: any) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name} ({acc.currency})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.to_account_id && <p className="text-xs text-red-500">{errors.to_account_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input 
                                type="number" 
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input 
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                            />
                             {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            placeholder="Reason for transfer..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <DialogFooter>
                         <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Transfer Funds
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
