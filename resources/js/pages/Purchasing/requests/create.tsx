import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';

// Manual routes
const indexUrl = '/purchasing/requests';
const storeUrl = '/purchasing/requests';

interface RequestItem {
    product_id: number;
    quantity: number;
    estimated_unit_price: number;
}

interface Props {
    products: any[];
}

export default function PurchaseRequestCreate({ products }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        date: string;
        required_date: string;
        notes: string;
        items: RequestItem[];
        budget?: string;
    }>({
        date: new Date().toISOString().split('T')[0],
        required_date: '',
        notes: '',
        items: [{ product_id: 0, quantity: 1, estimated_unit_price: 0 }],
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: 0, quantity: 1, estimated_unit_price: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) {
            toast.error('At least one item is required');
            return;
        }
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof RequestItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Auto-fill estimated price when product is selected (if available in product cost)
        if (field === 'product_id') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                newItems[index].estimated_unit_price = Number(product.cost || 0);
            }
        }
        
        setData('items', newItems);
    };

    const calculateSubtotal = (item: RequestItem) => {
        return item.quantity * item.estimated_unit_price;
    };

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (data.items.some(item => !item.product_id || item.product_id === 0)) {
            toast.error('Please select a product for all items');
            return;
        }

        post(storeUrl, {
            onSuccess: () => toast.success('Purchase Request created successfully.'),
            onError: () => toast.error('Please check the form for errors.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' }, 
            { title: 'Purchase Requests', href: '/purchasing/requests' },
            { title: 'New Request', href: '#' }
        ]}>
            <Head title="New Purchase Request" />
            
            <div>
                <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={indexUrl}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {errors.budget && (
                        <div className="bg-destructive/15 text-destructive p-3 rounded-md border border-destructive/20 mb-4">
                            <p className="font-medium text-sm">Budget Validation Failed</p>
                            <p className="text-sm">{errors.budget}</p>
                        </div>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Purchase Request</CardTitle>
                            <CardDescription>Fill in the details for your request.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    <InputError message={errors.date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="required_date">Required Date</Label>
                                    <Input
                                        id="required_date"
                                        type="date"
                                        value={data.required_date}
                                        onChange={(e) => setData('required_date', e.target.value)}
                                    />
                                    <InputError message={errors.required_date} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Justification or additional details..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Items</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                                        <div className="col-span-5 space-y-2">
                                            <Label>Product <span className="text-destructive">*</span></Label>
                                            <Select 
                                                value={item.product_id.toString()} 
                                                onValueChange={(value) => updateItem(index, 'product_id', Number(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={product.id.toString()}>
                                                            {product.name} ({product.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`items.${index}.product_id` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.product_id` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label>
                                                Quantity 
                                                <span className="text-destructive">*</span>
                                                {products.find(p => p.id === item.product_id)?.uom?.name && (
                                                    <span className="text-muted-foreground font-normal ml-1">
                                                        ({products.find(p => p.id === item.product_id)?.uom?.name})
                                                    </span>
                                                )}
                                            </Label>
                                            <Input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors[`items.${index}.quantity` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.quantity` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-3 space-y-2">
                                            <Label>Est. Price</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.estimated_unit_price}
                                                onChange={(e) => updateItem(index, 'estimated_unit_price', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="col-span-1 space-y-2">
                                            <Label>&nbsp;</Label>
                                            <div className="flex items-center h-10">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="flex justify-end pt-4 border-t">
                                    <span className="text-sm text-muted-foreground mr-2">Estimated Total:</span>
                                    <span className="font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={indexUrl}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
