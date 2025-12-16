import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { update, store, index } from '@/routes/master/warehouses';

interface Props {
    warehouse?: any;
}

export default function WarehouseForm({ warehouse }: Props) {
    const isEditing = !!warehouse;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        address: string;
    }>({
        name: warehouse?.name || '',
        address: warehouse?.address || '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(`Warehouse ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };

        if (isEditing) {
            put(update.url(warehouse.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Master Data', href: '#' }, 
            { title: 'Warehouses', href: '/master/warehouses' },
            { title: isEditing ? 'Edit Warehouse' : 'Create Warehouse', href: '#' }
        ]}>
            <div className="max-w-xl">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Warehouses
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Warehouse' : 'Create New Warehouse'}</CardTitle>
                        <CardDescription>
                            Define storage locations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Warehouse Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    placeholder="e.g. Main Warehouse"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address / Location</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="e.g. Building A, Floor 2"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Update Warehouse' : 'Create Warehouse'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
