import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { FormEvent, useEffect } from 'react';
import { store, index, create } from '@/routes/purchasing/receipts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ReceiptItem {
    product_id: number;
    uom_id: number;
    quantity: number;
    max_quantity: number; // for validation
    product_name: string;
    uom_name: string;
    notes: string;
}

interface Props {
    purchase_orders: any[];
    initial_po?: any;
}

export default function GoodsReceiptCreate({ purchase_orders, initial_po }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        purchase_order_id: number | '';
        warehouse_id: number | '';
        date: string;
        receipt_number: string;
        notes: string;
        items: ReceiptItem[];
    }>({
        purchase_order_id: initial_po?.id || '',
        warehouse_id: initial_po?.warehouse_id || '',
        date: new Date().toISOString().split('T')[0],
        receipt_number: `GR-${Math.floor(Date.now() / 1000)}`, // Simple auto-generation
        notes: '',
        items: [],
    });

    // When PO changes, load its items
    useEffect(() => {
        if (initial_po) {
            setData(prev => ({
                ...prev,
                purchase_order_id: initial_po.id,
                warehouse_id: initial_po.warehouse_id,
                items: initial_po.items.map((item: any) => ({
                    product_id: item.product_id,
                    uom_id: item.uom_id || 1, // Default to Unit (ID 1) if missing
                    quantity: Number(item.remaining_quantity), // Default to remaining
                    max_quantity: Number(item.remaining_quantity),
                    product_name: item.product?.name || 'Unknown Item',
                    uom_name: item.uom?.name || 'Unit',
                    notes: '',
                }))
            }));
        }
    }, [initial_po]);

    const handlePoChange = (poId: string) => {
        // Reload page with po_id param to fetch details via controller
        // This is safer than processing generic PO list locally if items aren't loaded
        router.visit(create.url({ query: { po_id: poId } }));
    };

    const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (data.items.length === 0) {
            toast.error('No items to receive.');
            return;
        }

        post(store.url(), {
            onSuccess: () => toast.success('Goods Receipt created successfully.'),
            onError: (err) => {
                console.error('Form Errors:', err);
                toast.error('Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Goods Receipts', href: '/purchasing/receipts' },
            { title: 'New Receipt', href: '#' }
        ]}>
            <Head title="New Goods Receipt" />

            <div>
                <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Receipts
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={submit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create Goods Receipt</CardTitle>
                                    <CardDescription>Receive items against a Purchase Order</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="purchase_order_id">Purchase Order <span className="text-destructive">*</span></Label>
                                            <Select
                                                value={data.purchase_order_id.toString()}
                                                onValueChange={handlePoChange}
                                            >
                                                <SelectTrigger id="purchase_order_id">
                                                    <SelectValue placeholder="Select PO to receive" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {purchase_orders.map((po) => (
                                                        <SelectItem key={po.id} value={po.id.toString()}>
                                                            {po.document_number} - {po.vendor?.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.purchase_order_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="receipt_number">Receipt Number <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="receipt_number"
                                                value={data.receipt_number}
                                                onChange={(e) => setData('receipt_number', e.target.value)}
                                            />
                                            <InputError message={errors.receipt_number} />
                                        </div>
                                    </div>

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
                                            <Label>Warehouse</Label>
                                            <Input
                                                value={initial_po?.warehouse?.name || 'Select PO first'}
                                                disabled
                                                className="bg-muted"
                                            />
                                            {/* Hidden input for submissions */}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Delivery notes, condition of goods, etc."
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                </CardContent>
                            </Card>

                            {initial_po && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Items to Receive</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {data.items.map((item, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-card text-card-foreground">
                                                    <div className="col-span-5 space-y-2">
                                                        <Label>Product</Label>
                                                        <div className="font-medium">{item.product_name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Remaining: {item.max_quantity} {item.uom_name}
                                                            {/* (Ordered: {item.quantity} - Received: {item.quantity_received}) */}
                                                        </div>
                                                    </div>

                                                    <div className="col-span-3 space-y-2">
                                                        <Label>Quantity Receiving</Label>
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            max={item.max_quantity * 1.5} // Allow some over-delivery?
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        />
                                                        {errors[`items.${index}.quantity` as keyof typeof errors] && (
                                                            <InputError message={errors[`items.${index}.quantity` as keyof typeof errors]} />
                                                        )}
                                                    </div>

                                                    <div className="col-span-3 space-y-2">
                                                        <Label>Item Notes</Label>
                                                        <Input
                                                            value={item.notes}
                                                            onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                            placeholder="Condition, batch, etc."
                                                        />
                                                    </div>

                                                    <div className="col-span-1 flex items-end pt-8">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                            className="text-destructive hover:text-destructive"
                                                            title="Don't receive this item"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {data.items.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No items to receive.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing || !initial_po}>
                                    {processing ? 'Saving...' : 'Save Draft (Received)'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar / Context */}
                    {initial_po && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Receipt History</CardTitle>
                                    <CardDescription>Previous receipts for this PO</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Number</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                                <TableHead className="w-[80px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {initial_po.goods_receipts?.map((gr: any) => (
                                                <TableRow key={gr.id}>
                                                    <TableCell className="font-medium text-xs">
                                                        {gr.receipt_number}
                                                        <div className="text-[10px] text-muted-foreground">{gr.date.split('T')[0]}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs">
                                                        {gr.items?.reduce((sum: number, i: any) => sum + Number(i.quantity_received), 0) || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">{gr.status}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {(!initial_po.goods_receipts || initial_po.goods_receipts.length === 0) && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-4">
                                                        No prior receipts.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
