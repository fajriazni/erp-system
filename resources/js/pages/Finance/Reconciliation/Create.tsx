
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateReconciliation({ accounts, selectedAccount }: any) {
    const { data, setData, post, processing, errors } = useForm({
        bank_account_id: selectedAccount ? String(selectedAccount.id) : '',
        statement_date: new Date().toISOString().split('T')[0],
        start_date: '',
        end_date: new Date().toISOString().split('T')[0],
        statement_balance: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.reconciliation.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Reconciliation', href: '/finance/reconciliation' },
            { title: 'New', href: '#' }
        ]}>
            <Head title="New Reconciliation" />
            
            <div className="max-w-xl mx-auto p-6">
                <div className="mb-6">
                     <Link href={route('finance.reconciliation.index')} className="text-sm text-muted-foreground hover:text-blue-600 flex items-center mb-2">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to List
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Start Reconciliation</h1>
                    <p className="text-muted-foreground">Select an account and period to reconcile.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Details</CardTitle>
                            <CardDescription>
                                Enter the ending balance from your physical bank statement.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="space-y-2">
                                <Label>Bank Account</Label>
                                <Select 
                                    value={data.bank_account_id}
                                    onValueChange={(val) => setData('bank_account_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((acc: any) => (
                                            <SelectItem key={acc.id} value={String(acc.id)}>
                                                {acc.name} ({acc.currency})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.bank_account_id && <p className="text-xs text-red-500">{errors.bank_account_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Statement Date</Label>
                                    <Input 
                                        type="date"
                                        value={data.statement_date}
                                        onChange={(e) => setData('statement_date', e.target.value)}
                                    />
                                    {errors.statement_date && <p className="text-xs text-red-500">{errors.statement_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Ending Balance</Label>
                                    <Input 
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={data.statement_balance}
                                        onChange={(e) => setData('statement_balance', e.target.value)}
                                    />
                                    {errors.statement_balance && <p className="text-xs text-red-500">{errors.statement_balance}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input 
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Usually start of the month.</p>
                                    {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input 
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end border-t p-4 bg-slate-50 dark:bg-slate-900/50">
                            <Button variant="ghost" className="mr-2" asChild>
                                <Link href={route('finance.reconciliation.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Reconciling
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
