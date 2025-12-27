import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import { ChevronLeft } from 'lucide-react';
import { Form } from '@/components/ui/form'; // Using Shadcn Form if available? Or raw form? Let's use standard form for now.

interface Props {
    accounts: any[];
}

export default function DeferredCreate({ accounts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        type: 'expense',
        total_amount: '',
        start_date: '',
        end_date: '',
        deferred_account_id: '',
        recognition_account_id: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/accounting/deferred');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Deferred', href: '/accounting/deferred' }, { title: 'New', href: '#' }]}>
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/accounting/deferred">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Create Deferred Schedule</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Reference Code</Label>
                                    <Input 
                                        value={data.code} 
                                        onChange={e => setData('code', e.target.value)} 
                                        placeholder="e.g. DEF-2024-001"
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Schedule Name</Label>
                                    <Input 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        placeholder="e.g. Office Rent 2024"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="expense">Deferred Expense (Prepaid)</SelectItem>
                                        <SelectItem value="revenue">Deferred Revenue (Unearned)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Total Amount</Label>
                                    <Input 
                                        type="number" 
                                        value={data.total_amount} 
                                        onChange={e => setData('total_amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.total_amount && <p className="text-sm text-destructive">{errors.total_amount}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input 
                                        type="date" 
                                        value={data.start_date} 
                                        onChange={e => setData('start_date', e.target.value)}
                                    />
                                    {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input 
                                        type="date" 
                                        value={data.end_date} 
                                        onChange={e => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>
                                        {data.type === 'expense' ? 'Prepaid Asset Account' : 'Liability Account (Unearned)'}
                                    </Label>
                                    <Select value={data.deferred_account_id} onValueChange={val => setData('deferred_account_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                                    {acc.code} - {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.deferred_account_id && <p className="text-sm text-destructive">{errors.deferred_account_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        {data.type === 'expense' ? 'Expense Account' : 'Revenue Account'}
                                    </Label>
                                    <Select value={data.recognition_account_id} onValueChange={val => setData('recognition_account_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                                    {acc.code} - {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.recognition_account_id && <p className="text-sm text-destructive">{errors.recognition_account_id}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild><Link href="/accounting/deferred">Cancel</Link></Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Schedule'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
