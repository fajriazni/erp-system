import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
}

interface PurchaseOrder {
    id: number;
    document_number: string;
}

interface Props {
    vendors: Vendor[];
    purchaseOrders: PurchaseOrder[];
}

export default function Create({ vendors, purchaseOrders }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        vendor_id: '',
        purchase_order_id: '',
        claim_type: 'damaged_goods',
        claim_amount: 0,
        description: '',
        evidence_attachments: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/purchasing/claims');
    };

    return (
        <AppLayout>
            <Head title="File Vendor Claim" />

            <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/purchasing/claims">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">File Vendor Claim</h1>
                        <p className="text-muted-foreground">
                            Submit a compensation claim against vendor
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Claim Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Vendor *</Label>
                                        <Select
                                            value={data.vendor_id}
                                            onValueChange={(value) =>
                                                setData('vendor_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vendors.map((vendor) => (
                                                    <SelectItem
                                                        key={vendor.id}
                                                        value={vendor.id.toString()}
                                                    >
                                                        {vendor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.vendor_id && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.vendor_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Purchase Order (Optional)</Label>
                                        <Select
                                            value={data.purchase_order_id}
                                            onValueChange={(value) =>
                                                setData('purchase_order_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select PO" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {purchaseOrders.map((po) => (
                                                    <SelectItem
                                                        key={po.id}
                                                        value={po.id.toString()}
                                                    >
                                                        {po.document_number}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Claim Type *</Label>
                                        <Select
                                            value={data.claim_type}
                                            onValueChange={(value) =>
                                                setData('claim_type', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="price_difference">
                                                    Price Difference
                                                </SelectItem>
                                                <SelectItem value="damaged_goods">
                                                    Damaged Goods
                                                </SelectItem>
                                                <SelectItem value="missing_items">
                                                    Missing Items
                                                </SelectItem>
                                                <SelectItem value="shipping_cost">
                                                    Shipping Cost
                                                </SelectItem>
                                                <SelectItem value="quality_issue">
                                                    Quality Issue
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Claim Amount *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={data.claim_amount}
                                            onChange={(e) =>
                                                setData(
                                                    'claim_amount',
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            placeholder="0.00"
                                        />
                                        {errors.claim_amount && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.claim_amount}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Description *</Label>
                                    <Textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData('description', e.target.value)
                                        }
                                        rows={5}
                                        placeholder="Describe the issue and provide details..."
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Evidence (Optional)</Label>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setData('evidence_attachments', files as any);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload photos, documents, or PDFs as evidence
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-2">
                            <Link href="/purchasing/claims">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Submit Claim
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
