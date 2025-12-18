import { Head, Link, useForm } from '@inertiajs/react';
import * as PriceLists from '@/actions/App/Http/Controllers/Sales/Operations/PriceListController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have a Checkbox component
import { Textarea } from '@/components/ui/textarea';

export default function PriceListCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        currency: 'IDR',
        is_active: true,
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(PriceLists.store.url());
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Price Lists', href: PriceLists.index.url() }, { title: 'Create', href: '#' }]}>
            <Head title="Create Price List" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Create Price List</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Price List Details</CardTitle>
                            <CardDescription>Define a new pricing tier.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name <span className="text-red-500">*</span></Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Wholesale 2025" />
                                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Input value={data.currency} onChange={e => setData('currency', e.target.value)} maxLength={3} />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input 
                                        type="checkbox" 
                                        id="active" 
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={data.is_active} 
                                        onChange={e => setData('is_active', e.target.checked)} 
                                    />
                                    <Label htmlFor="active">Active</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Optional description..." />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="secondary" asChild>
                                    <Link href={PriceLists.index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>Create Price List</Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
