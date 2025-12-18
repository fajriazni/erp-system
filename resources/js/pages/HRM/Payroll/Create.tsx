import { Head, Link, useForm } from '@inertiajs/react';
import * as Payroll from '@/actions/App/Http/Controllers/HRM/PayrollController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PayrollCreate() {
    const { data, setData, post, processing, errors } = useForm({
        period_start: '',
        period_end: '',
        pay_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(Payroll.store.url());
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Payroll', href: Payroll.index.url() }, { title: 'Run', href: '#' }]}>
            <Head title="Run Payroll" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Run New Payroll</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Period Details</CardTitle>
                            <CardDescription>Select the period to generate payslips for.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Period Start</Label>
                                <Input type="date" value={data.period_start} onChange={e => setData('period_start', e.target.value)} />
                                {errors.period_start && <div className="text-red-500 text-xs">{errors.period_start}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Period End</Label>
                                <Input type="date" value={data.period_end} onChange={e => setData('period_end', e.target.value)} />
                                {errors.period_end && <div className="text-red-500 text-xs">{errors.period_end}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Pay Date</Label>
                                <Input type="date" value={data.pay_date} onChange={e => setData('pay_date', e.target.value)} />
                                {errors.pay_date && <div className="text-red-500 text-xs">{errors.pay_date}</div>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" asChild>
                            <Link href={Payroll.index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>Generate Payslips</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
