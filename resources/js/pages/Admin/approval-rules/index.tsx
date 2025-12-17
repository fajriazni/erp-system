import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalRule {
    id: number;
    name: string;
    entity_type: string;
    min_amount: number;
    max_amount: number | null;
    role_id: number | null;
    user_id: number | null;
    level: number;
    is_active: boolean;
    role?: { id: number; name: string };
    user?: { id: number; name: string; email: string };
}

interface Props {
    rules: ApprovalRule[];
}

const entityTypeLabels: Record<string, string> = {
    purchase_request: 'Purchase Request',
    purchase_order: 'Purchase Order',
    expense: 'Expense',
    vendor_bill: 'Vendor Bill',
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function ApprovalRulesIndex({ rules }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this approval rule?')) {
            router.delete(`/admin/approval-rules/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/admin' },
            { title: 'Approval Rules', href: '/admin/approval-rules' }
        ]}>
            <Head title="Approval Rules" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Approval Rules
                        </h2>
                        <Link href="/admin/approval-rules/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Rule
                            </Button>
                        </Link>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Dynamic Approval Matrix</CardTitle>
                            <CardDescription>
                                Configure approval rules based on document type and amount thresholds.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Document Type</TableHead>
                                        <TableHead>Amount Range</TableHead>
                                        <TableHead>Approver</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rules.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No approval rules configured. Add your first rule to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rules.map((rule) => (
                                            <TableRow key={rule.id}>
                                                <TableCell className="font-medium">{rule.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {entityTypeLabels[rule.entity_type] || rule.entity_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(rule.min_amount)}
                                                    {rule.max_amount ? ` - ${formatCurrency(rule.max_amount)}` : '+'}
                                                </TableCell>
                                                <TableCell>
                                                    {rule.role && (
                                                        <Badge variant="secondary">Role: {rule.role.name}</Badge>
                                                    )}
                                                    {rule.user && (
                                                        <span className="text-sm">{rule.user.name}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">Level {rule.level}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {rule.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            <XCircle className="mr-1 h-3 w-3" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/admin/approval-rules/${rule.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(rule.id)}
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
            </div>
        </AppLayout>
    );
}
