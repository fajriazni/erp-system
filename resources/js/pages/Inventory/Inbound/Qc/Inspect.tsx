import { Head, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Props {
    item: any;
    defect_codes: any[];
    previous_inspections: any[];
}

export default function Inspect({ item, defect_codes, previous_inspections }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        passed_qty: item.quantity_received,
        failed_qty: 0,
        defect_reason: '',
        notes: '',
        status: 'passed'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.inbound.qc.store', item.id));
    };

    // Auto-update status based on logic
    const handleFailedChange = (val: number) => {
        const passed = item.quantity_received - val;
        setData(data => ({
            ...data,
            failed_qty: val,
            passed_qty: passed >= 0 ? passed : 0,
            status: val > 0 ? 'failed' : 'passed' 
        }));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Inventory', href: '/inventory' }, 
            { title: 'QC', href: route('inventory.inbound.qc') },
            { title: 'Inspect', href: '#' }
        ]}>
            <Head title={`Inspect ${item.product.sku}`} />
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto p-6">
                <PageHeader 
                    title={`QC Inspection: ${item.product.name}`}
                    description={`Receipt #${item.goods_receipt.receipt_number} | SKU: ${item.product.sku}`}
                    backUrl={route('inventory.inbound.qc')}
                >
                    <Button type="submit" disabled={processing} variant={data.status === 'failed' ? 'destructive' : 'default'}>
                        {data.status === 'failed' ? 'Record Failure' : 'Pass Inspection'}
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Item Details */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Item Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Product</Label>
                                <div className="font-medium">{item.product.name}</div>
                                <div className="text-sm text-muted-foreground">{item.product.sku}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Quantity Received</Label>
                                <div className="text-2xl font-bold">{item.quantity_received} {item.uom?.code}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Current QC Status</Label>
                                <div className="mt-1">
                                    <Badge variant="outline">{item.qc_status || 'Pending'}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inspection Form */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Inspection Result</CardTitle>
                            <CardDescription>Record the quantities passed and failed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Passed Quantity</Label>
                                    <Input 
                                        type="number" 
                                        value={data.passed_qty} 
                                        onChange={e => setData('passed_qty', parseFloat(e.target.value))}
                                        className="bg-green-50 border-green-200"
                                    />
                                    {errors.passed_qty && <div className="text-red-500 text-sm">{errors.passed_qty}</div>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Failed Quantity</Label>
                                    <Input 
                                        type="number" 
                                        value={data.failed_qty} 
                                        onChange={e => handleFailedChange(parseFloat(e.target.value))}
                                        className={data.failed_qty > 0 ? "bg-red-50 border-red-200" : ""}
                                    />
                                    {errors.failed_qty && <div className="text-red-500 text-sm">{errors.failed_qty}</div>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Inspection Status</Label>
                                <Select value={data.status} onValueChange={val => setData('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="passed">Passed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="conditional">Conditional Acceptance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.failed_qty > 0 && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-red-600">Defect Reason</Label>
                                    <Select value={data.defect_reason} onValueChange={val => setData('defect_reason', val)}>
                                        <SelectTrigger className="border-red-200">
                                            <SelectValue placeholder="Select Defect Code" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {defect_codes.map((code: any) => (
                                                <SelectItem key={code.id} value={code.code}>
                                                    {code.code} - {code.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.defect_reason && <div className="text-red-500 text-sm">{errors.defect_reason}</div>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea 
                                    value={data.notes} 
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Enter inspection notes..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
