import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    vendors?: Array<{
        id: number;
        name: string;
    }>;
    products?: Array<{
        id: number;
        name: string;
        sku: string;
        purchase_price: number;
    }>;
    warehouses?: Array<{
        id: number;
        name: string;
    }>;
}

export default function DirectPurchasing({ vendors = [], products = [], warehouses = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        vendor_id: '',
        warehouse_id: '',
        product_id: '',
        quantity: 1,
        unit_price: '',
        notes: '',
        emergency: false,
    });

    const { props } = usePage<any>();
    const flashError = props.errors?.error || props.flash?.error;

    const selectedProduct = products.find(p => p.id === Number(data.product_id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/purchasing/direct', {
            onSuccess: () => {
                // Reset form or redirect
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Operations', href: '/purchasing' },
            { title: 'Direct Purchasing', href: '/purchasing/direct' }
        ]}>
            <Head title="Direct Purchasing" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Direct Purchasing"
                    description="Quick PO creation for urgent procurement without RFQ process."
                >
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/purchasing/orders">View All POs</a>
                        </Button>
                    </div>
                </PageHeader>

                {/* Benefits Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <Zap className="h-8 w-8 text-amber-600 mb-2" />
                            <CardTitle className="text-lg">Fast Processing</CardTitle>
                            <CardDescription>
                                Create PO in under 30 seconds for urgent needs
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                            <CardTitle className="text-lg">Auto Approval</CardTitle>
                            <CardDescription>
                                Low-value purchases auto-approved based on threshold
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                            <CardTitle className="text-lg">Budget Check</CardTitle>
                            <CardDescription>
                                Real-time budget availability verification
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Quick PO Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Purchase Order</CardTitle>
                        <CardDescription>
                            Simplified form for direct procurement from trusted vendors
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {flashError && (
                            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-6">
                                <p className="font-medium">Error</p>
                                <p className="text-sm">{flashError}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor">Vendor *</Label>
                                    <Select
                                        value={data.vendor_id}
                                        onValueChange={(value) => setData('vendor_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map((vendor) => (
                                                <SelectItem key={vendor.id} value={String(vendor.id)}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.vendor_id && <p className="text-sm text-red-600">{errors.vendor_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="warehouse">Warehouse *</Label>
                                    <Select
                                        value={data.warehouse_id}
                                        onValueChange={(value) => setData('warehouse_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((w) => (
                                                <SelectItem key={w.id} value={String(w.id)}>
                                                    {w.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.warehouse_id && <p className="text-sm text-red-600">{errors.warehouse_id}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="product">Product *</Label>
                                    <Select
                                        value={data.product_id}
                                        onValueChange={(value) => {
                                            setData('product_id', value);
                                            const product = products.find(p => p.id === Number(value));
                                            if (product) {
                                                setData('unit_price', String(product.purchase_price));
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.sku} - {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.product_id && <p className="text-sm text-red-600">{errors.product_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', Number(e.target.value))}
                                        required
                                    />
                                    {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="unit_price">Unit Price *</Label>
                                    <Input
                                        id="unit_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.unit_price}
                                        onChange={(e) => setData('unit_price', e.target.value)}
                                        required
                                    />
                                    {errors.unit_price && <p className="text-sm text-red-600">{errors.unit_price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Total Amount</Label>
                                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                                        <span className="font-semibold">
                                            {new Intl.NumberFormat('id-ID', { 
                                                style: 'currency', 
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                            }).format(data.quantity * Number(data.unit_price || 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes or justification for direct purchase..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="emergency"
                                    checked={data.emergency}
                                    onChange={(e) => setData('emergency', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="emergency" className="font-normal">
                                    Mark as Emergency Procurement (requires justification)
                                </Label>
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/purchasing')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Package className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Purchase Order'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Box */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Quick Tips</h3>
                                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    <li>• Direct purchasing bypasses RFQ for faster procurement</li>
                                    <li>• Use only for trusted vendors and urgent needs</li>
                                    <li>• Orders below threshold are automatically approved</li>
                                    <li>• All direct purchases are tracked and audited</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
