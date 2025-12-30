import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExpenseClaim {
    id: number;
    title: string;
    description: string;
    total_amount: string;
    status: string;
    created_at: string;
    user?: { name: string };
    department?: { name: string; code: string };
}

interface Props {
    claims: {
        data: ExpenseClaim[];
        links: any;
    };
    filters: {
        tab?: string;
    };
}

export default function ExpenseIndex({ claims, filters }: Props) {
    const handleTabChange = (value: string) => {
        router.get('/finance/expenses/reimbursements', { tab: value }, { preserveState: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            case 'submitted': return 'warning'; // custom variant if exists, else secondary
            case 'paid': return 'success'; // custom variant
            default: return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Finance', href: '/accounting' }, { title: 'Reimbursements' }]}>
            <Head title="Reimbursements" />
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Expense Reimbursements</h1>
                    <Button asChild>
                        <Link href="/finance/expenses/reimbursements/create">
                            <Plus className="mr-2 h-4 w-4" /> New Claim
                        </Link>
                    </Button>
                </div>

                <Tabs defaultValue={filters.tab || 'my-claims'} onValueChange={handleTabChange} className="mb-6">
                    <TabsList>
                        <TabsTrigger value="my-claims">My Claims</TabsTrigger>
                        <TabsTrigger value="approval">To Approve</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Card>
                    <CardHeader>
                        <CardTitle>Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Claim Title</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {claims.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No claims found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    claims.data.map((claim) => (
                                        <TableRow key={claim.id}>
                                            <TableCell>
                                                {new Date(claim.created_at).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell className="font-medium">{claim.title}</TableCell>
                                            <TableCell>{claim.user?.name}</TableCell>
                                            <TableCell>{claim.department?.code}</TableCell>
                                            <TableCell className="text-right">
                                                Rp {parseFloat(claim.total_amount).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={claim.status === 'approved' ? 'default' : (claim.status === 'rejected' ? 'destructive' : 'secondary')}>
                                                    {claim.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/finance/expenses/reimbursements/${claim.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
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
