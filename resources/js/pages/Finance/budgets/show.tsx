import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit } from 'lucide-react';

interface Budget {
    id: number;
    name: string;
    fiscal_year: number;
    period_type: string;
    period_number: number;
    amount: string;
    warning_threshold: string;
    is_strict: boolean;
    is_active: boolean;
    department?: { id: number; name: string; code: string };
    account?: { id: number; code: string; name: string };
    encumbrances: Encumbrance[];
    encumbered_amount: number;
    available_amount: number;
    utilization_percent: number;
}

interface Encumbrance {
    id: number;
    amount: string;
    status: string;
    created_at: string;
    encumberable?: {
        id: number;
        document_number?: string;
    };
    encumberable_type: string;
}

interface Props {
    budget: Budget;
}

export default function BudgetShow({ budget }: Props) {
    const getUtilizationColor = (percent: number) => {
        if (percent >= 100) return 'text-red-600';
        if (percent >= parseFloat(budget.warning_threshold)) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getEncumberableLabel = (type: string) => {
        if (type.includes('PurchaseRequest')) return 'Purchase Request';
        if (type.includes('PurchaseOrder')) return 'Purchase Order';
        return type.split('\\').pop() || type;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/accounting' },
            { title: 'Budgets', href: '/finance/budgets' },
            { title: budget.name }
        ]}>
            <Head title={`Budget: ${budget.name}`} />
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link href="/finance/budgets">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/finance/budgets/${budget.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Budget</CardDescription>
                            <CardTitle className="text-2xl">
                                Rp {parseFloat(budget.amount).toLocaleString('id-ID')}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Encumbered (Committed)</CardDescription>
                            <CardTitle className="text-2xl text-yellow-600">
                                Rp {(budget.encumbered_amount || 0).toLocaleString('id-ID')}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Available</CardDescription>
                            <CardTitle className={`text-2xl ${getUtilizationColor(budget.utilization_percent || 0)}`}>
                                Rp {(budget.available_amount || 0).toLocaleString('id-ID')}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{budget.name}</CardTitle>
                        <CardDescription>
                            {budget.department?.name || 'No Department'} • FY {budget.fiscal_year}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground">Period Type</span>
                                <p className="font-medium capitalize">{budget.period_type}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Warning Threshold</span>
                                <p className="font-medium">{budget.warning_threshold}%</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Mode</span>
                                <p>
                                    <Badge variant={budget.is_strict ? 'destructive' : 'secondary'}>
                                        {budget.is_strict ? 'Strict (Block)' : 'Warning Only'}
                                    </Badge>
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Utilization</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${budget.utilization_percent >= 100 ? 'bg-red-500' : budget.utilization_percent >= parseFloat(budget.warning_threshold) ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(budget.utilization_percent || 0, 100)}%` }}
                                        />
                                    </div>
                                    <span className={`font-medium ${getUtilizationColor(budget.utilization_percent || 0)}`}>
                                        {(budget.utilization_percent || 0).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Encumbrances (Committed Amounts)</CardTitle>
                        <CardDescription>
                            Active commitments from approved Purchase Requests and Orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budget.encumbrances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No encumbrances recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    budget.encumbrances.map((enc) => (
                                        <TableRow key={enc.id}>
                                            <TableCell>{getEncumberableLabel(enc.encumberable_type)}</TableCell>
                                            <TableCell>{enc.encumberable?.document_number || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                Rp {parseFloat(enc.amount).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={enc.status === 'active' ? 'default' : 'secondary'}>
                                                    {enc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(enc.created_at).toLocaleDateString('id-ID')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
