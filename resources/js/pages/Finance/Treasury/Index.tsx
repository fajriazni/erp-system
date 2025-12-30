
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, ArrowRightLeft, Landmark, History, Wallet, TrendingUp, TrendingDown, MoreHorizontal, FileText } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils'; // Assuming this utility exists, if not I'll create a local helper or use Intl
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';

// Helper for currency if not exists
const formatMoney = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
};

export default function TreasuryIndex({ accounts, filters }: any) {
    const [transferOpen, setTransferOpen] = useState(false);
    
    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Treasury & Cash', href: '/finance/treasury' }
        ]}>
            <Head title="Treasury Management" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            Treasury & Cash
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage all your bank accounts, liquidity, and cash flow in one place.
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                         <TransferModal 
                             accounts={accounts.data} 
                             open={transferOpen}
                             onOpenChange={setTransferOpen}
                         />

                        <Button asChild className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                            <Link href={route('finance.treasury.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Bank Account
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-100 dark:border-blue-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Liquidity</CardTitle>
                            <Wallet className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatMoney(accounts.data.reduce((acc: any, curr: any) => acc + Number(curr.current_balance), 0))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Across {accounts.data.length} active accounts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Inflow</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Outflow</CardTitle>
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bank Accounts Grid */}
                <h2 className="text-lg font-semibold mt-4">Bank Accounts</h2>
                
                {accounts.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50/50">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <Landmark className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium">No Bank Accounts Configured</h3>
                        <p className="text-slate-500 max-w-sm text-center mt-2 mb-6">
                            Start by adding your first bank account to track transactions and manage cash flow.
                        </p>
                        <Button asChild>
                            <Link href={route('finance.treasury.create')}>Add First Account</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {accounts.data.map((account: any) => (
                            <Link 
                                key={account.id} 
                                href={route('finance.treasury.show', account.id)}
                                className="group block h-full"
                            >
                                <Card className="h-full hover:border-blue-500 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Landmark className="h-24 w-24 -mr-8 -mt-8" />
                                    </div>
                                    
                                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                                        <div className="space-y-1 z-10">
                                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                                {account.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                {account.bank_name} • <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">{account.account_number}</span>
                                            </CardDescription>
                                        </div>
                                         <Badge variant={account.is_active ? 'default' : 'secondary'} className="z-10">
                                            {account.currency}
                                        </Badge>
                                    </CardHeader>
                                    
                                    <CardContent className="pb-4 z-10 relative">
                                        <div className="mt-4">
                                            <span className="text-sm text-muted-foreground">Current Balance</span>
                                            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                {formatMoney(Number(account.current_balance), account.currency)}
                                            </div>
                                        </div>
                                    </CardContent>
                                    
                                    <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t p-3 flex justify-between z-10 relative">
                                         <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-blue-600">
                                                <History className="mr-2 h-3 w-3" />
                                                History
                                            </Button>
                                         </div>
                                         
                                        <MoreActions account={account} />
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function MoreActions({ account }: any) {
    // Stop propagation to prevent navigation when clicking dropdown
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); 
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleClick}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={route('finance.treasury.edit', account.id)}>Edit Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Bank Reconciliation</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TransferModal({ accounts, open, onOpenChange }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.treasury.transfer'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Internal Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transfer Funds</DialogTitle>
                    <DialogDescription>
                        Move funds between your internal bank accounts.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                                        <SelectItem key={acc.id} value={String(acc.id)} disabled={acc.id == data.to_account_id}>
                                            {acc.name} ({acc.currency})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                             {errors.from_account_id && <p className="text-xs text-red-500">{errors.from_account_id}</p>}
                        </div>
                        
                        <div className="space-y-2">
                             <Label>To Account</Label>
                             <Select 
                                value={data.to_account_id}
                                onValueChange={(val) => setData('to_account_id', val)}
                             >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Dest" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((acc: any) => (
                                        <SelectItem key={acc.id} value={String(acc.id)} disabled={acc.id == data.from_account_id}>
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
                                min="0.01" 
                                step="0.01" 
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
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                            />
                             {errors.transaction_date && <p className="text-xs text-red-500">{errors.transaction_date}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description / Note</Label>
                        <Textarea 
                            placeholder="e.g. Monthly funding for petty cash" 
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                         {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Processing...' : 'Transfer Funds'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
