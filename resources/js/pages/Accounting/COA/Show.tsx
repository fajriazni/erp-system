import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import * as COA from '@/actions/App/Http/Controllers/Accounting/ChartOfAccountController';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    description: string;
    is_active: boolean;
    parent?: {
        id: number;
        code: string;
        name: string;
    };
    children?: Account[];
}

interface Transaction {
    id: number;
    reference_number: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
}

interface Props {
    account: Account;
    balance: number;
    recentTransactions: Transaction[];
}

export default function Show({ account, balance, recentTransactions }: Props) {
    const handleDelete = () => {
        router.delete(COA.destroy.url(account.id), {
            onSuccess: () => router.visit(COA.index.url()),
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Chart of Accounts', href: COA.index.url() },
                { title: account.code, href: '#' },
            ]}
        >
            <Head title={`${account.code} - ${account.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <PageHeader
                    title={`${account.code} - ${account.name}`}
                    description={
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={account.type === 'asset' || account.type === 'expense' ? 'default' : 'secondary'}>
                                {account.type.toUpperCase()}
                            </Badge>
                            <Badge variant={account.is_active ? 'default' : 'outline'}>
                                {account.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    }
                    className="mb-6"
                >
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={COA.edit.url(account.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this account. This action cannot be undone.
                                        {account.children && account.children.length > 0 && 
                                            <p className="text-red-500 mt-2 font-bold">Warning: This account has sub-accounts.</p>
                                        }
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" asChild>
                            <Link href={COA.index.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                            </Link>
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Account Code</p>
                                <p className="font-mono text-lg font-semibold">{account.code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Account Name</p>
                                <p className="text-lg">{account.name}</p>
                            </div>
                            {account.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="text-sm">{account.description}</p>
                                </div>
                            )}
                            {account.parent && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Parent Account</p>
                                    <Link
                                        href={COA.show.url(account.parent.id)}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {account.parent.code} - {account.parent.name}
                                    </Link>
                                </div>
                            )}
                            {account.children && account.children.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Sub-Accounts ({account.children.length})</p>
                                    <div className="space-y-1">
                                        {account.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={COA.show.url(child.id)}
                                                className="block text-sm text-primary hover:underline"
                                            >
                                                {child.code} - {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Balance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-6 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                                    <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                                </div>
                                <div className="text-right">
                                    {balance >= 0 ? (
                                        <TrendingUp className="h-12 w-12 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-12 w-12 text-red-600" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions && recentTransactions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>{formatDate(transaction.date)}</TableCell>
                                            <TableCell className="font-mono">{transaction.reference_number}</TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell className="text-right">
                                                {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No transactions found for this account.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
