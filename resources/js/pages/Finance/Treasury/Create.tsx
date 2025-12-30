
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';


export default function CreateBankAccount({ coas }: any) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        bank_name: '',
        account_number: '',
        currency: 'IDR',
        opening_balance: '0',
        current_balance: '0', // Will be synced with opening on frontend logic if needed, but easier to just send same
        chart_of_account_id: '',
        description: '',
        is_active: true,
        type: new URLSearchParams(window.location.search).get('type') || 'bank',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Force current = opening on create
        data.current_balance = data.opening_balance;
        post(route('finance.treasury.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Treasury', href: '/finance/treasury' },
            { title: 'Create Account', href: '#' }
        ]}>
            <Head title="Create Bank Account" />
            
            <div className="max-w-3xl mx-auto p-6">
                <div className="mb-6">
                     <Link href={route('finance.treasury.index')} className="text-sm text-muted-foreground hover:text-blue-600 flex items-center mb-2">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Treasury
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Add Bank Account</h1>
                    <p className="text-muted-foreground">Register a new bank account or cash drawer.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Enter the details of the bank account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Account Name (Reference)</Label>
                                    <Input 
                                        placeholder="e.g. BCA Operational" 
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Bank / Provider Name</Label>
                                    <Input 
                                        placeholder="e.g. Bank Central Asia" 
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                    />
                                    {errors.bank_name && <p className="text-xs text-red-500">{errors.bank_name}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input 
                                        placeholder="e.g. 1234567890" 
                                        value={data.account_number}
                                        onChange={(e) => setData('account_number', e.target.value)}
                                    />
                                    {errors.account_number && <p className="text-xs text-red-500">{errors.account_number}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select 
                                        value={data.currency}
                                        onValueChange={(val) => setData('currency', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.currency && <p className="text-xs text-red-500">{errors.currency}</p>}
                                </div>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Opening Balance</Label>
                                    <Input 
                                        type="number"
                                        placeholder="0.00" 
                                        value={data.opening_balance}
                                        onChange={(e) => setData('opening_balance', e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground">The balance as of today.</p>
                                    {errors.opening_balance && <p className="text-xs text-red-500">{errors.opening_balance}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Linked GL Account</Label>
                                    <Select 
                                        value={data.chart_of_account_id}
                                        onValueChange={(val) => setData('chart_of_account_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Asset Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {coas.map((coa: any) => (
                                                <SelectItem key={coa.id} value={String(coa.id)}>
                                                    {coa.code} - {coa.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground">Transactions will be posted to this General Ledger account.</p>
                                    {errors.chart_of_account_id && <p className="text-xs text-red-500">{errors.chart_of_account_id}</p>}
                                </div>
                            </div>

                             <div className="space-y-2">
                                <Label>Account Type</Label>
                                <Select 
                                    value={data.type}
                                    onValueChange={(val) => setData('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Account Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank">Bank Account</SelectItem>
                                        <SelectItem value="cash">Petty Cash / Drawer</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="ewallet">E-Wallet</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Textarea 
                                    placeholder="Additional notes..." 
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end border-t p-4 bg-slate-50 dark:bg-slate-900/50">
                            <Button variant="ghost" className="mr-2" asChild>
                                <Link href={route('finance.treasury.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
