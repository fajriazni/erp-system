import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import { toast } from 'sonner';
import { index, store } from '@/routes/purchasing/payment-terms'; // Ensure Wayfinder generated this

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        type: 'standard', // standard | schedule
        days_due: 0,
        schedule_definition: [
            { description: 'payment', percent: 100, trigger: 'approval', days_due: 0 }
        ],
        is_active: true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onSuccess: () => toast.success('Payment term created successfully.'),
            onError: () => toast.error('Please check the form for errors.'),
        });
    };

    const addScheduleRow = () => {
        setData('schedule_definition', [
            ...data.schedule_definition,
            { description: '', percent: 0, trigger: 'approval', days_due: 0 }
        ]);
    };

    const removeScheduleRow = (index: number) => {
        if (data.schedule_definition.length === 1) return;
        const newSchedule = data.schedule_definition.filter((_, i) => i !== index);
        setData('schedule_definition', newSchedule);
    };

    const updateScheduleRow = (index: number, field: string, value: any) => {
        const newSchedule = [...data.schedule_definition];
        // @ts-ignore
        newSchedule[index][field] = value;
        setData('schedule_definition', newSchedule);
    };

    const calculateTotalPercent = () => {
        return data.schedule_definition.reduce((sum, item) => sum + Number(item.percent), 0);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Payment Terms', href: index.url() },
            { title: 'Create', href: '#' }
        ]}>
            <Head title="Create Payment Term" />

            <div className="max-w-4xl">
                 <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Term Details</CardTitle>
                            <CardDescription>Define the payment term rules.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Net 30"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(val) => setData('type', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">Standard (Net N)</SelectItem>
                                            <SelectItem value="schedule">Schedule (Installments)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>
                                
                                {data.type === 'standard' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="days_due">Days Due <span className="text-destructive">*</span></Label>
                                        <Input
                                            type="number"
                                            id="days_due"
                                            value={data.days_due}
                                            onChange={(e) => setData('days_due', parseInt(e.target.value))}
                                            min="0"
                                        />
                                        <p className="text-xs text-muted-foreground">Days after invoice date.</p>
                                        <InputError message={errors.days_due} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {data.type === 'schedule' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Schedule Definition</CardTitle>
                                    <CardDescription>
                                        Define payment installments. Total: {calculateTotalPercent()}%
                                    </CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addScheduleRow}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Installment
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.schedule_definition.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-start p-4 border rounded-lg">
                                            <div className="col-span-4 space-y-2">
                                                <Label className="text-xs">Description</Label>
                                                <Input 
                                                    value={item.description} 
                                                    onChange={(e) => updateScheduleRow(idx, 'description', e.target.value)} 
                                                    placeholder="e.g. Down Payment"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label className="text-xs">Percent (%)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={item.percent} 
                                                    onChange={(e) => updateScheduleRow(idx, 'percent', parseFloat(e.target.value))} 
                                                />
                                            </div>
                                            <div className="col-span-3 space-y-2">
                                                <Label className="text-xs">Trigger</Label>
                                                <Select value={item.trigger} onValueChange={(val) => updateScheduleRow(idx, 'trigger', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="approval">PO Approval</SelectItem>
                                                        <SelectItem value="receipt">Goods Receipt</SelectItem>
                                                        <SelectItem value="invoice">Bill Date</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label className="text-xs">Days Offset</Label>
                                                <Input 
                                                    type="number" 
                                                    value={item.days_due} 
                                                    onChange={(e) => updateScheduleRow(idx, 'days_due', parseInt(e.target.value))} 
                                                />
                                            </div>
                                            <div className="col-span-1 flex items-center justify-end h-full pt-6">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleRow(idx)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {calculateTotalPercent() !== 100 && (
                                        <p className="text-sm text-destructive font-semibold">Total percentage must be 100% (Current: {calculateTotalPercent()}%)</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing || (data.type === 'schedule' && calculateTotalPercent() !== 100)}>
                            {processing ? 'Saving...' : 'Create Payment Term'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
