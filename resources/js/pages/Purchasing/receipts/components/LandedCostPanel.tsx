import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Truck, Shield, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LandedCost {
    id: number;
    cost_type: string;
    description: string;
    amount: number;
    allocation_method: string;
}

interface Props {
    receiptId: number;
    landedCosts: LandedCost[];
    isPosted: boolean;
}

const costTypeIcons: Record<string, React.ReactNode> = {
    freight: <Truck className="h-4 w-4" />,
    insurance: <Shield className="h-4 w-4" />,
    customs: <Package className="h-4 w-4" />,
};

const costTypeLabels: Record<string, string> = {
    freight: 'Freight / Shipping',
    insurance: 'Insurance',
    customs: 'Customs / Import Duty',
    handling: 'Handling / Loading',
    other: 'Other',
};

const allocationMethodLabels: Record<string, string> = {
    by_value: 'By Value',
    by_quantity: 'By Quantity',
    by_weight: 'By Weight',
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function LandedCostPanel({ receiptId, landedCosts, isPosted }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        cost_type: 'freight',
        description: '',
        amount: '',
        allocation_method: 'by_value',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('purchasing.receipts.landed-costs.store', receiptId), formData, {
            onSuccess: () => {
                setIsOpen(false);
                setFormData({ cost_type: 'freight', description: '', amount: '', allocation_method: 'by_value' });
            },
        });
    };

    const handleDelete = (costId: number) => {
        if (confirm('Are you sure you want to remove this cost?')) {
            router.delete(route('purchasing.receipts.landed-costs.destroy', [receiptId, costId]));
        }
    };

    const totalLandedCost = landedCosts.reduce((sum, cost) => sum + cost.amount, 0);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Landed Costs</CardTitle>
                        <CardDescription>Additional costs (freight, insurance, customs)</CardDescription>
                    </div>
                    {!isPosted && (
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add Cost
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Landed Cost</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Cost Type</Label>
                                        <Select
                                            value={formData.cost_type}
                                            onValueChange={(v) => setFormData({ ...formData, cost_type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(costTypeLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="e.g., DHL Express Shipping"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount (IDR)</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Allocation Method</Label>
                                        <Select
                                            value={formData.allocation_method}
                                            onValueChange={(v) => setFormData({ ...formData, allocation_method: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(allocationMethodLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                        <Button type="submit">Add Cost</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {landedCosts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No landed costs added yet.
                    </p>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    {!isPosted && <TableHead className="w-10"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {landedCosts.map((cost) => (
                                    <TableRow key={cost.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {costTypeIcons[cost.cost_type] || <Package className="h-4 w-4" />}
                                                <span>{costTypeLabels[cost.cost_type] || cost.cost_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{cost.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {allocationMethodLabels[cost.allocation_method] || cost.allocation_method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(cost.amount)}
                                        </TableCell>
                                        {!isPosted && (
                                            <TableCell>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(cost.id)}
                                                >
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Landed Cost</p>
                                <p className="text-lg font-semibold">{formatCurrency(totalLandedCost)}</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
