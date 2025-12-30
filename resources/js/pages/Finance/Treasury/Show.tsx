
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Download, Filter, CalendarDays, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const formatMoney = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
};

export default function TreasuryShow({ account }: any) {
    const [transactionOpen, setTransactionOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Treasury', href: '/finance/treasury' },
            { title: account.name, href: '#' }
        ]}>
            <Head title={`${account.name} - Treasury`} />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={route('finance.treasury.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
                                <Badge variant={account.is_active ? 'default' : 'secondary'}>
                                    {account.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                 <Badge variant="outline">{account.currency}</Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {account.bank_name} • {account.account_number}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Statement
                        </Button>
                         <TransactionModal 
                            account={account} 
                            open={transactionOpen} 
                            onOpenChange={setTransactionOpen} 
                        />
                    </div>
                </div>

                {/* Account Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-950 text-white border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Current Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">
                                {formatMoney(Number(account.current_balance), account.currency)}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Last updated: Today
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Opening Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-semibold">
                                {formatMoney(Number(account.opening_balance), account.currency)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Reconciliation Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">Pending</Badge>
                                <span className="text-sm text-muted-foreground">Last reconciled: Never</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                             <CardTitle>Transaction History</CardTitle>
                             <CardDescription>Recent deposits, withdrawals, and transfers.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                             <Button variant="outline" size="sm">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Date Range
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {account.transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    account.transactions.map((trx: any) => (
                                        <TableRow key={trx.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {new Date(trx.transaction_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[300px] truncate" title={trx.description}>
                                                    {trx.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {trx.reference || '-'}
                                            </TableCell>
                                            <TableCell>
                                                 {(trx.type === 'deposit' || trx.type === 'transfer_in') ? (
                                                     <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                                        <ArrowDownLeft className="mr-1 h-3 w-3" />
                                                        Deposit
                                                     </Badge>
                                                 ) : (
                                                     <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">
                                                        <ArrowUpRight className="mr-1 h-3 w-3" />
                                                        Withdrawal
                                                     </Badge>
                                                 )}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${(trx.type === 'deposit' || trx.type === 'transfer_in') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {(trx.type === 'deposit' || trx.type === 'transfer_in') ? '+' : '-'} {formatMoney(Number(trx.amount), account.currency)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="text-xs">
                                                    {trx.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function TransactionModal({ account, open, onOpenChange }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'deposit',
        amount: '',
        description: '',
        reference: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.treasury.transaction', account.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Transaction</DialogTitle>
                    <DialogDescription>
                        Manually record a deposit or withdrawal for this account.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label>Type</Label>
                             <Select 
                                value={data.type}
                                onValueChange={(val) => setData('type', val)}
                             >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deposit">Deposit (In)</SelectItem>
                                    <SelectItem value="withdrawal">Withdrawal (Out)</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input 
                                type="date"
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input 
                            type="number" 
                            min="0.01" 
                            step="0.01" 
                            placeholder="0.00" 
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                         {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Reference (Optional)</Label>
                        <Input 
                            placeholder="e.g. INV-001, PO-123" 
                            value={data.reference}
                            onChange={(e) => setData('reference', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            placeholder="Transaction details..." 
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                         {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing} className={data.type === 'withdrawal' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}>
                            {data.type === 'withdrawal' ? 'Record Withdrawal' : 'Record Deposit'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
