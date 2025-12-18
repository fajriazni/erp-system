import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { start, inspect } from '@/routes/purchasing/receipts/qc';

interface GrItem {
    id: number;
    product: { name: string; sku?: string };
    quantity_received: number;
    qc_status: string;
    qc_passed_qty: number;
    qc_failed_qty: number;
    qc_notes?: string;
}

interface Props {
    receiptId: number;
    items: GrItem[];
    isPosted: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> },
    in_qa: { label: 'In QA', color: 'bg-blue-100 text-blue-800', icon: <ClipboardCheck className="h-3 w-3" /> },
    passed: { label: 'Passed', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function QcInspectionPanel({ receiptId, items, isPosted }: Props) {
    const [selectedItem, setSelectedItem] = useState<GrItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        passed_qty: '',
        failed_qty: '',
        notes: '',
    });

    const [processing, setProcessing] = useState(false);

    const openInspection = (item: GrItem) => {
        setSelectedItem(item);
        setFormData({
            passed_qty: '0',
            failed_qty: '0',
            notes: '',
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        const passed = parseFloat(formData.passed_qty) || 0;
        const failed = parseFloat(formData.failed_qty) || 0;
        const total = passed + failed;
        const remaining = selectedItem.quantity_received - selectedItem.qc_passed_qty - selectedItem.qc_failed_qty;

        if (total > remaining) {
            toast.error(`Total inspected (${total}) exceeds remaining quantity (${remaining}).`);
            return;
        }

        setProcessing(true);
        router.post(inspect.url({ receipt: receiptId, item: selectedItem.id }), {
            ...formData,
            passed_qty: formData.passed_qty || 0,
            failed_qty: formData.failed_qty || 0
        }, {
            onSuccess: () => {
                toast.success('Inspection recorded.');
                setIsOpen(false);
                setSelectedItem(null);
                setProcessing(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to save inspection. Check values.');
                setProcessing(false);
            }
        });
    };

    const handleStartQc = (itemId: number) => {
        router.post(start.url({ receipt: receiptId, item: itemId }));
    };

    // Calculate summary stats
    const totalQty = items.reduce((sum, item) => sum + item.quantity_received, 0);
    const passedQty = items.reduce((sum, item) => sum + item.qc_passed_qty, 0);
    const failedQty = items.reduce((sum, item) => sum + item.qc_failed_qty, 0);
    const pendingQty = totalQty - passedQty - failedQty;
    const passRate = totalQty > 0 ? (passedQty / totalQty) * 100 : 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Quality Control</CardTitle>
                        <CardDescription>Inspect received items before storing to inventory</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{totalQty}</p>
                        <p className="text-xs text-muted-foreground">Total Qty</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{passedQty}</p>
                        <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{failedQty}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">{pendingQty}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                </div>

                {/* Pass Rate Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Pass Rate</span>
                        <span className="font-medium">{passRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={passRate} className="h-2" />
                </div>

                {/* Items Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center">Received</TableHead>
                            <TableHead className="text-center">Passed</TableHead>
                            <TableHead className="text-center">Failed</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            {isPosted && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => {
                            const status = statusConfig[item.qc_status] || statusConfig.pending;
                            const remainingQty = item.quantity_received - item.qc_passed_qty - item.qc_failed_qty;

                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            {item.product.sku && (
                                                <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity_received}</TableCell>
                                    <TableCell className="text-center text-green-600 font-medium">
                                        {item.qc_passed_qty}
                                    </TableCell>
                                    <TableCell className="text-center text-red-600 font-medium">
                                        {item.qc_failed_qty}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={status.color}>
                                            <span className="mr-1">{status.icon}</span>
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    {isPosted && (
                                        <TableCell className="text-right">
                                            {item.qc_status === 'pending' && (
                                                <Button size="sm" variant="outline" onClick={() => handleStartQc(item.id)}>
                                                    Start QC
                                                </Button>
                                            )}
                                            {(item.qc_status === 'in_qa' || item.qc_status === 'partial') && remainingQty > 0 && (
                                                <Button size="sm" onClick={() => openInspection(item)}>
                                                    Inspect ({remainingQty})
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {/* Inspection Dialog */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Inspection</DialogTitle>
                        </DialogHeader>
                        {selectedItem && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-medium">{selectedItem.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Remaining: {selectedItem.quantity_received - selectedItem.qc_passed_qty - selectedItem.qc_failed_qty} units
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-green-600">Passed Qty</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.passed_qty}
                                            onChange={(e) => setFormData({ ...formData, passed_qty: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-600">Failed Qty</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.failed_qty}
                                            onChange={(e) => setFormData({ ...formData, failed_qty: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Optional inspection notes..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Inspection</Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
