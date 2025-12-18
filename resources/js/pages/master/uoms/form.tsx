import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { update, store, index } from '@/routes/master/uoms';

interface Props {
    uom?: any;
}

export default function UomForm({ uom }: Props) {
    const isEditing = !!uom;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        symbol: string;
    }>({
        name: uom?.name || '',
        symbol: uom?.symbol || '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(`Unit ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };

        if (isEditing) {
            put(update.url(uom.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Master Data', href: '#' }, 
            { title: 'Units of Measure', href: '/master/uoms' },
            { title: isEditing ? 'Edit Unit' : 'Create Unit', href: '#' }
        ]}>
            <div className="max-w-xl">
                <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Utilities
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Unit' : 'Create New Unit'}</CardTitle>
                        <CardDescription>
                            Define a unit of measurement (e.g., Kilogram, Box).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Unit Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    placeholder="e.g. Kilogram"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="symbol">Symbol / Abbreviation</Label>
                                <Input
                                    id="symbol"
                                    value={data.symbol}
                                    onChange={e => setData('symbol', e.target.value)}
                                    placeholder="e.g. kg"
                                />
                                <InputError message={errors.symbol} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Update Unit' : 'Create Unit'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
