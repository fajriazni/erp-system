import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    parent_id: number | null;
    code: string;
    name: string;
    type: string;
    is_active: boolean;
    children?: Account[];
    parent?: Account;
}

interface Props {
    accounts: Account[];
    isSearch: boolean;
    filters: {
        search?: string;
    };
}

const AccountRow = ({ account, level = 0 }: { account: Account; level?: number }) => {
    const [expanded, setExpanded] = React.useState(true);
    const hasChildren = account.children && account.children.length > 0;
    const { delete: destroy } = useForm();

    const handleDelete = () => {
        destroy(`/accounting/coa/${account.id}`);
    };

    return (
        <>
            <TableRow className="hover:bg-muted/50">
                <TableCell className="font-mono">
                    <span style={{ paddingLeft: `${level * 20}px` }} className="flex items-center gap-2">
                        {hasChildren ? (
                            <button 
                                onClick={() => setExpanded(!expanded)}
                                className="p-0.5 hover:bg-slate-200 rounded"
                            >
                                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <span className="w-5" />
                        )}
                        {account.code}
                    </span>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {hasChildren ? <Folder className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-slate-500" />}
                        {account.name}
                    </div>
                </TableCell>
                <TableCell><Badge variant="outline">{account.type}</Badge></TableCell>
                <TableCell>
                   {account.is_active ? (
                       <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                   ) : (
                       <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
                   )}
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/accounting/coa/${account.id}/edit`}>
                                <Edit className="w-4 h-4 text-blue-600" />
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this account? This action cannot be undone.
                                        {hasChildren && <p className="text-red-500 mt-2 font-bold">Cannot delete account with sub-accounts.</p>}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={hasChildren as boolean} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
            </TableRow>
            {hasChildren && expanded && account.children?.map(child => (
                <AccountRow key={child.id} account={child} level={level + 1} />
            ))}
        </>
    );
};

export default function Index({ accounts, isSearch, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/accounting/coa');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Chart of Accounts', href: '/accounting/coa' },
            ]}
        >
            <Head title="Chart of Accounts" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
                        <p className="text-muted-foreground">Manage your organization's accounts hierarchy.</p>
                    </div>
                    <Button asChild>
                        <Link href="/accounting/coa/create">
                            <Plus className="mr-2 h-4 w-4" /> New Account
                        </Link>
                    </Button>
                </div>

                <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <Input 
                            placeholder="Search by code or name..." 
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary" disabled={processing}>Search</Button>
                        {isSearch && (
                            <Button variant="ghost" asChild>
                                <Link href="/accounting/coa">Clear</Link>
                            </Button>
                        )}
                    </form>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.length > 0 ? (
                                    isSearch ? (
                                        // Flat list for search results
                                        accounts.map(account => (
                                            <TableRow key={account.id} className="hover:bg-muted/50">
                                                 <TableCell className="font-mono">{account.code}</TableCell>
                                                 <TableCell>
                                                    <div>{account.name}</div>
                                                    {account.parent && <div className="text-xs text-muted-foreground">Parent: {account.parent.code} - {account.parent.name}</div>}
                                                 </TableCell>
                                                 <TableCell><Badge variant="outline">{account.type}</Badge></TableCell>
                                                 <TableCell>
                                                    {account.is_active ? (<Badge className="bg-green-100 text-green-800">Active</Badge>) : (<Badge variant="secondary">Inactive</Badge>)}
                                                 </TableCell>
                                                 <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/accounting/coa/${account.id}/edit`}>
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </Link>
                                                    </Button>
                                                 </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        // Recursive tree view
                                        accounts.map(account => (
                                            <AccountRow key={account.id} account={account} />
                                        ))
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No accounts found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
