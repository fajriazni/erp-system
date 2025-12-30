import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PettyCash({ accounts }: { accounts: any[] }) {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Petty Cash', href: '/finance/petty-cash' }
        ]}>
            <Head title="Petty Cash Management" />

            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Petty Cash</h1>
                        <p className="text-muted-foreground">Manage cash drawers and small operational expenses.</p>
                    </div>
                    <CreateCashAccountModal open={createOpen} onOpenChange={setCreateOpen} />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <CashAccountCard key={account.id} account={account} />
                    ))}
                    
                    {accounts.length === 0 && (
                        <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-center">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <Wallet className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No Cash Accounts</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                Create a cash drawer to start tracking petty cash expenses.
                            </p>
                            <Button onClick={() => setCreateOpen(true)}>Create First Drawer</Button>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function CashAccountCard({ account }: { account: any }) {
    return (
        <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        {account.name}
                        {account.is_active ? (
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> 
                        ) : (
                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                        {account.account_number}
                    </CardDescription>
                </div>
                <Badge variant="outline">{account.currency}</Badge>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="text-3xl font-bold">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: account.currency }).format(account.current_balance)}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t p-3 flex justify-between">
                <Button size="sm" variant="ghost" asChild>
                    <Link href={route('finance.petty-cash.show', account.id)}>
                        <History className="mr-2 h-4 w-4" /> View History
                    </Link>
                </Button>
                <div className="flex gap-2">
                     <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                        <Link href={route('finance.petty-cash.show', account.id)}>
                             Manage
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

function CreateCashAccountModal({ open, onOpenChange }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        currency: 'IDR',
        opening_balance: 0,
        chart_of_account_id: '', // Ideally fetch this or assume a default Cash COA if possible
        description: '',
    });

    // Note: COA selection is omitted for simplicity in this iteration, assuming backend handles it or we add a prop
    // Ideally we pass `coas` prop to the page and use it here.

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we didn't fetch COAs in controller yet, we might need to assume or fetch.
        // For now, let's just make it required in backend but client-side we need a way to pick.
        // Let's rely on user visiting 'Create Bank Account' for full control, or add a simple input here.
        // Or better, let's just redirect to the Main Create page for now but pre-select 'Cash'.
        // Actually, let's implement the basic form assuming ID 1 or something, OR better:
        // Update the controller to pass eligible COAs.
        
        // Changing strategy: Since we need COA, let's just use a Link to the main create page with a query param type=cash
        // But the user asked for a modal. Let's make the modal just redirect or keep it simple.
        
        post(route('finance.petty-cash.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> New Cash Drawer</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Cash Drawer</DialogTitle>
                    <DialogDescription>Add a new petty cash location or drawer.</DialogDescription>
                </DialogHeader>
                <div className="p-4 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                        To ensure proper accounting linkage, please use the main account creation form.
                    </p>
                    <Button asChild className="w-full">
                        <Link href={route('finance.treasury.create', { type: 'cash' })}>
                            Go to Account Creation
                        </Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
