import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { update, store, index } from '@/routes/master/contacts';

interface Props {
    contact?: any;
}

export default function ContactForm({ contact }: Props) {
    const isEditing = !!contact;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        type: string;
        email: string;
        phone: string;
        address: string;
        tax_id: string;
    }>({
        name: contact?.name || '',
        type: contact?.type || 'customer',
        email: contact?.email || '',
        phone: contact?.phone || '',
        address: contact?.address || '',
        tax_id: contact?.tax_id || '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(`Contact ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };

        if (isEditing) {
            put(update.url(contact.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Master Data', href: '#' }, 
            { title: 'Contacts', href: '/master/contacts' },
            { title: isEditing ? 'Edit Contact' : 'Create Contact', href: '#' }
        ]}>
            <div className="max-w-4xl">
                <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contacts
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Contact' : 'Create New Contact'}</CardTitle>
                        <CardDescription>
                            {isEditing ? `Edit details for ${contact.name}` : 'Add a new customer or vendor to your database.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name / Company</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        placeholder="Company Name or Individual Name"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={data.type} onValueChange={val => setData('type', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="customer">Customer</SelectItem>
                                            <SelectItem value="vendor">Vendor (Supplier)</SelectItem>
                                            <SelectItem value="both">Both (Customer & Vendor)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="contact@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="+62 812..."
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="tax_id">Tax ID (NPWP)</Label>
                                <Input
                                    id="tax_id"
                                    value={data.tax_id}
                                    onChange={e => setData('tax_id', e.target.value)}
                                    placeholder="Optional"
                                />
                                <InputError message={errors.tax_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Complete address..."
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Update Contact' : 'Create Contact'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
