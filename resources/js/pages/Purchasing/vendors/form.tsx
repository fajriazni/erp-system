import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { store, update, index } from '@/routes/purchasing/vendors';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    vendor?: any;
    paymentTerms?: any[];
}

export default function VendorForm({ vendor, paymentTerms = [] }: Props) {
    const isEditing = !!vendor;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        email: string;
        phone: string;
        address: string;
        tax_id: string;
        payment_term_id: string;
    }>({
        name: vendor?.name || '',
        email: vendor?.email || '',
        phone: vendor?.phone || '',
        address: vendor?.address || '',
        tax_id: vendor?.tax_id || '',
        payment_term_id: vendor?.payment_term_id ? String(vendor.payment_term_id) : '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(`Vendor ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };

        if (isEditing) {
            put(update.url(vendor.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' }, 
            { title: 'Vendors', href: '/purchasing/vendors' },
            { title: isEditing ? 'Edit Vendor' : 'New Vendor', href: '#' }
        ]}>
            <Head title={isEditing ? `Edit ${vendor.name}` : "New Vendor"} />
            
            <div className="max-w-4xl">
                <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? `Edit ${vendor.name}` : 'Create New Vendor'}</CardTitle>
                        <CardDescription>
                            {isEditing ? 'Update vendor details' : 'Add a new vendor or supplier to the system.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Vendor name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="vendor@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1234567890"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tax_id">Tax ID</Label>
                                    <Input
                                        id="tax_id"
                                        value={data.tax_id}
                                        onChange={(e) => setData('tax_id', e.target.value)}
                                        placeholder="Tax identification number"
                                    />
                                    <InputError message={errors.tax_id} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_term_id">Default Payment Term</Label>
                                    <Select
                                        value={data.payment_term_id}
                                        onValueChange={(val) => setData('payment_term_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment term" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentTerms?.map((term) => (
                                                <SelectItem key={term.id} value={String(term.id)}>
                                                    {term.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                     <p className="text-xs text-muted-foreground">
                                        This will be the default for new Purchase Orders.
                                    </p>
                                    <InputError message={errors.payment_term_id} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Full address..."
                                    rows={3}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : (isEditing ? 'Update Vendor' : 'Create Vendor')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
