import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import { index, update } from '@/routes/purchasing/receipts';

interface Prodocut {
    id: number;
    name: string;
    code: string;
}

interface Uom {
    id: number;
    name: string;
}

interface ReceiptItem {
    id?: number; // Existing item ID
    product_id: number;
    uom_id: number;
    quantity: number;
    max_quantity: number; 
    product_name: string;
    uom_name: string;
    notes: string;
}

interface Props {
    receipt: any;
    purchase_order: any;
}

export default function GoodsReceiptEdit({ receipt, purchase_order }: Props) {
    const { data, setData, put, processing, errors } = useForm<{
        date: string;
        receipt_number: string;
        notes: string;
        items: ReceiptItem[];
    }>({
        date: receipt.date.split('T')[0],
        receipt_number: receipt.receipt_number,
        notes: receipt.notes || '',
        items: receipt.items.map((item: any) => {
            // Find corresponding PO item to determine max/remaining
            const poItem = purchase_order.items.find((pi: any) => pi.product_id === item.product_id);
            // Remaining = (Total Ordered) - (Received in OTHER receipts)
            // But here, 'item.quantity' is what is currently saved in THIS draft.
            // If we want to allow them to receive MORE, we need to know the PO limit.
            // Simplified: Max = (PO Qty - PO Received) + (This Item Current Qty)
            // Because PO Received includes this item if it was posted (but it's draft so it doesn't).
            const remainingOnPo = poItem ? Math.max(0, poItem.quantity - poItem.quantity_received) : 0;
            
            return {
                id: item.id,
                product_id: item.product_id,
                uom_id: item.uom_id,
                quantity: Number(item.quantity_received),
                max_quantity: remainingOnPo + Number(item.quantity_received), // Allow user to set up to total availability
                product_name: item.product?.name || 'Unknown',
                uom_name: item.uom?.name || 'Unit',
                notes: item.notes || '',
            };
        }),
    });

    const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    const removeItem = (index: number) => {
        if (confirm('Are you sure you want to remove this item from the receipt?')) {
            setData('items', data.items.filter((_, i) => i !== index));
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (data.items.length === 0) {
            toast.error('No items to receive.');
            return;
        }

        put(update.url(receipt.id), {
            onSuccess: () => toast.success('Goods Receipt updated successfully.'),
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
            { title: receipt.receipt_number, href: '#' }
        ]}>
            <Head title={`Edit ${receipt.receipt_number}`} />
            
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
                                    <CardTitle>Edit Goods Receipt</CardTitle>
                                    <div className="flex justify-between items-center">
                                        <CardDescription>
                                            PO: {purchase_order.document_number}
                                        </CardDescription>
                                        <Badge variant="outline">{receipt.status}</Badge>
                                    </div>
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
                                            <Label htmlFor="receipt_number">Receipt Number <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="receipt_number"
                                                value={data.receipt_number}
                                                onChange={(e) => setData('receipt_number', e.target.value)}
                                            />
                                            <InputError message={errors.receipt_number} />
                                        </div>
                                    </div>

                                     <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Notes..."
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-card text-card-foreground">
                                                <div className="col-span-12 md:col-span-5 space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Product</Label>
                                                    <div className="font-medium">{item.product_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Max: {item.max_quantity} {item.uom_name}
                                                    </div>
                                                </div>

                                                <div className="col-span-6 md:col-span-3 space-y-1">
                                                    <Label className="text-xs">Qty Received</Label>
                                                    <Input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        max={item.max_quantity * 1.5}
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    />
                                                     {errors[`items.${index}.quantity` as keyof typeof errors] && (
                                                        <InputError message={errors[`items.${index}.quantity` as keyof typeof errors]} />
                                                    )}
                                                </div>

                                                <div className="col-span-5 md:col-span-3 space-y-1">
                                                    <Label className="text-xs">Notes</Label>
                                                     <Input
                                                        className="h-9"
                                                        value={item.notes}
                                                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                        placeholder="Notes"
                                                    />
                                                </div>

                                                <div className="col-span-1 flex justify-end pt-6">
                                                     <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(index)}
                                                        className="text-destructive hover:text-destructive h-8 w-8"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar / Context */}
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
                                        {purchase_order.goods_receipts?.filter((gr: any) => gr.id !== receipt.id).map((gr: any) => (
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
                                        {(!purchase_order.goods_receipts || purchase_order.goods_receipts.filter((gr: any) => gr.id !== receipt.id).length === 0) && (
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
                </div>
            </div>
        </AppLayout>
    );
}
