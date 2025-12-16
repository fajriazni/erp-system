import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { update, store, index } from '@/routes/master/products';

interface Props {
    product?: any;
}

export default function ProductForm({ product }: Props) {
    const isEditing = !!product;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        code: string;
        type: string;
        price: number;
        cost: number;
        stock_control: boolean;
        notes: string;
    }>({
        name: product?.name || '',
        code: product?.code || '',
        type: product?.type || 'goods',
        price: product?.price || 0,
        cost: product?.cost || 0,
        stock_control: product?.stock_control !== undefined ? !!product.stock_control : true,
        notes: product?.notes || '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };

        if (isEditing) {
            put(update.url(product.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Master Data', href: '#' }, 
            { title: 'Products', href: '/master/products' },
            { title: isEditing ? 'Edit Product' : 'Create Product', href: '#' }
        ]}>
            <div className="max-w-4xl">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Product' : 'Create New Product'}</CardTitle>
                        <CardDescription>
                            {isEditing ? `Edit details for ${product.name}` : 'Add a new product or service to the catalog.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code / SKU</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                        required
                                        placeholder="e.g. PROD-001"
                                    />
                                    <InputError message={errors.code} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        placeholder="Product Name"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={data.type} onValueChange={val => setData('type', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="goods">Goods (Stockable)</SelectItem>
                                            <SelectItem value="service">Service (Consumable)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox 
                                        id="stock_control" 
                                        checked={data.stock_control}
                                        onCheckedChange={(checked) => setData('stock_control', !!checked)}
                                    />
                                    <Label htmlFor="stock_control" className="font-normal cursor-pointer">
                                        Track Inventory (Stock Control)
                                    </Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Sales Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', parseFloat(e.target.value))}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.price} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Standard Cost</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        value={data.cost}
                                        onChange={e => setData('cost', parseFloat(e.target.value))}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.cost} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Additional information about this product..."
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Update Product' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
