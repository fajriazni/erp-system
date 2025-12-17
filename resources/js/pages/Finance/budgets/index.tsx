import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Budget {
    id: number;
    name: string;
    fiscal_year: number;
    period_type: string;
    amount: string;
    warning_threshold: string;
    is_strict: boolean;
    is_active: boolean;
    department?: { id: number; name: string; code: string };
    account?: { id: number; code: string; name: string };
    encumbered_amount: number;
    available_amount: number;
    utilization_percent: number;
}

interface Props {
    budgets: {
        data: Budget[];
        links: any;
    };
    filters: {
        search?: string;
        fiscal_year?: string;
    };
}

export default function BudgetIndex({ budgets, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/finance/budgets', { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this budget?')) {
            router.delete(`/finance/budgets/${id}`);
        }
    };

    const getUtilizationColor = (percent: number, threshold: number) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= threshold) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Finance', href: '/accounting' }, { title: 'Budgets' }]}>
            <Head title="Budgets" />
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Budget Management</h1>
                    <Button asChild>
                        <Link href="/finance/budgets/create">
                            <Plus className="mr-2 h-4 w-4" /> Create Budget
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Budgets</CardTitle>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    placeholder="Search budgets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-64"
                                />
                                <Button type="submit" variant="outline" size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Fiscal Year</TableHead>
                                    <TableHead className="text-right">Budget</TableHead>
                                    <TableHead className="text-right">Used</TableHead>
                                    <TableHead>Utilization</TableHead>
                                    <TableHead>Mode</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budgets.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            No budgets found. Create your first budget.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    budgets.data.map((budget) => (
                                        <TableRow key={budget.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/finance/budgets/${budget.id}`} className="hover:underline">
                                                    {budget.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{budget.department?.name || '-'}</TableCell>
                                            <TableCell>{budget.fiscal_year}</TableCell>
                                            <TableCell className="text-right">
                                                {parseFloat(budget.amount).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {budget.encumbered_amount?.toLocaleString('id-ID') || 0}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${getUtilizationColor(budget.utilization_percent || 0, parseFloat(budget.warning_threshold))}`}
                                                            style={{ width: `${Math.min(budget.utilization_percent || 0, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {(budget.utilization_percent || 0).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={budget.is_strict ? 'destructive' : 'secondary'}>
                                                    {budget.is_strict ? 'Strict' : 'Warning'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/finance/budgets/${budget.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(budget.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
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
