import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { index, store, update } from '@/routes/purchasing/pricelists';

interface Props {
    pricelist?: any;
    vendors: { id: number; name: string }[];
    products: { id: number; name: string; code: string }[];
}

export default function Form({ pricelist, vendors, products }: Props) {
    const isEditing = !!pricelist;
    
    const { data, setData, post, put, processing, errors } = useForm({
        vendor_id: pricelist?.vendor_id?.toString() || '',
        product_id: pricelist?.product_id?.toString() || '',
        price: pricelist?.price || '',
        min_quantity: pricelist?.min_quantity || '1',
        vendor_product_code: pricelist?.vendor_product_code || '',
        vendor_product_name: pricelist?.vendor_product_name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(pricelist.id));
        } else {
            post(store.url());
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Price Lists', href: index.url() },
            { title: isEditing ? 'Edit Pricelist' : 'Create Pricelist' }
        ]}>
            <Head title={isEditing ? 'Edit Pricelist' : 'Create Pricelist'} />
            
            <div className="container mx-auto max-w-2xl">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={index.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? 'Edit Pricelist' : 'Create New Pricelist'}
                    </h1>
                    <p className="text-muted-foreground">
                        Define pricing for a specific vendor and product.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor_id">Vendor</Label>
                                    <Select 
                                        value={data.vendor_id} 
                                        onValueChange={(val) => setData('vendor_id', val)}
                                    >
                                        <SelectTrigger id="vendor_id" className={errors.vendor_id ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Select vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map((vendor) => (
                                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.vendor_id && <p className="text-sm text-destructive">{errors.vendor_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="product_id">Product</Label>
                                    <Select 
                                        value={data.product_id} 
                                        onValueChange={(val) => setData('product_id', val)}
                                    >
                                        <SelectTrigger id="product_id" className={errors.product_id ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    {product.code} - {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.product_id && <p className="text-sm text-destructive">{errors.product_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="min_quantity">Min. Quantity</Label>
                                    <Input
                                        id="min_quantity"
                                        type="number"
                                        step="0.01"
                                        value={data.min_quantity}
                                        onChange={(e) => setData('min_quantity', e.target.value)}
                                        className={errors.min_quantity ? "border-destructive" : ""}
                                    />
                                    <p className="text-xs text-muted-foreground">Minimum quantity to apply this price.</p>
                                    {errors.min_quantity && <p className="text-sm text-destructive">{errors.min_quantity}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (Unit Cost)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className={errors.price ? "border-destructive" : ""}
                                    />
                                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vendor_product_code">Vendor Product Code (SKU)</Label>
                                <Input
                                    id="vendor_product_code"
                                    value={data.vendor_product_code}
                                    onChange={(e) => setData('vendor_product_code', e.target.value)}
                                    placeholder="e.g. V-12345"
                                />
                                <p className="text-xs text-muted-foreground">Optional: Code used by the vendor for this product.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vendor_product_name">Vendor Product Name</Label>
                                <Input
                                    id="vendor_product_name"
                                    value={data.vendor_product_name}
                                    onChange={(e) => setData('vendor_product_name', e.target.value)}
                                    placeholder="Optional: Name used by the vendor"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditing ? 'Update Pricelist' : 'Create Pricelist'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
