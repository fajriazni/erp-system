import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import * as COA from '@/actions/App/Http/Controllers/Accounting/ChartOfAccountController';
import { Button } from '@/components/ui/button';
import {
    Plus, Edit, Trash2, Folder, FileText,
    ChevronRight, ChevronDown, PlusCircle, Search,
    ChevronLast, ChevronFirst,
    ArrowUpCircle, ArrowDownCircle, Wallet, Scale
} from 'lucide-react';
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
import { PageHeader } from '@/components/ui/page-header';
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
import { cn } from '@/lib/utils';

interface Account {
    id: number;
    parent_id: number | null;
    code: string;
    name: string;
    type: string;
    is_active: boolean;
    balance: number;
    children?: Account[];
    parent?: Account;
}

interface SummaryStats {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netWorth: number;
}

interface Props {
    accounts: Account[];
    isSearch: boolean;
    filters: {
        search?: string;
    };
    stats: SummaryStats;
}

const typeColors: Record<string, string> = {
    asset: "bg-blue-100 text-blue-800 border-blue-200",
    liability: "bg-red-100 text-red-800 border-red-200",
    equity: "bg-purple-100 text-purple-800 border-purple-200",
    revenue: "bg-green-100 text-green-800 border-green-200",
    expense: "bg-orange-100 text-orange-800 border-orange-200",
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const AccountRow = ({
    account,
    level = 0,
    allExpanded = true
}: {
    account: Account;
    level?: number;
    allExpanded: boolean;
}) => {
    const [expanded, setExpanded] = React.useState(true);
    const hasChildren = account.children && account.children.length > 0;
    const { delete: destroy } = useForm();

    // Sync with global expanded state
    React.useEffect(() => {
        setExpanded(allExpanded);
    }, [allExpanded]);

    const handleDelete = () => {
        router.delete(COA.destroy.url(account.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <TableRow 
                className="hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => router.visit(COA.show.url(account.id))}
            >
                <TableCell className="font-mono py-3 relative" onClick={(e) => e.stopPropagation()}>
                    {/* Depth markers */}
                    {Array.from({ length: level }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute border-l border-slate-200 h-full top-0"
                            style={{ left: `${(i * 24) + 12}px` }}
                        />
                    ))}

                    <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2 relative z-10">
                        {hasChildren ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpanded(!expanded);
                                }}
                                className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                            >
                                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <span className="w-5" />
                        )}
                        <span className="font-semibold text-slate-700">{account.code}</span>
                    </div>
                </TableCell>
                <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                        {hasChildren ?
                            <Folder className="w-4 h-4 text-blue-500 fill-blue-50" /> :
                            <FileText className="w-4 h-4 text-slate-400" />
                        }
                        <span className={cn(hasChildren ? "font-semibold" : "font-normal")}>
                            {account.name}
                        </span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={cn("capitalize px-2 py-0", typeColors[account.type])}>
                        {account.type}
                    </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                    <span className={account.balance < 0 ? "text-red-600" : "text-slate-900"}>
                        {formatCurrency(account.balance)}
                    </span>
                </TableCell>
                <TableCell>
                    <div className="flex items-center justify-center">
                        {account.is_active ? (
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        ) : (
                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                    </div>
                </TableCell>
                <TableCell className="text-right py-3">
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
                </TableCell>
            </TableRow>
            {hasChildren && expanded && account.children?.map(child => (
                <AccountRow key={child.id} account={child} level={level + 1} allExpanded={allExpanded} />
            ))}
        </>
    );
};

export default function Index({ accounts, isSearch, filters, stats }: Props) {
    const [allExpanded, setAllExpanded] = React.useState(true);
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        get(COA.index.url(), { 
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (data.search !== (filters.search || '')) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [data.search]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Chart of Accounts', href: '/accounting/coa' },
            ]}
        >
            <Head title="Chart of Accounts" />

            <div className="space-y-6 w-full">
                {/* Header Section */}
                <PageHeader
                    title="Chart of Accounts"
                    description="Manage your financial structure with recursive hierarchy and real-time balances."
                >
                    <Button asChild>
                        <Link href={COA.create.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Account
                        </Link>
                    </Button>
                </PageHeader>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                                <ArrowUpCircle className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalAssets)}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                                <ArrowDownCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalLiabilities)}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
                                <Wallet className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalEquity)}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                                <Scale className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.netWorth)}</div>
                            </CardContent>
                        </Card>
                </div>

                {/* Search and Table Area */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by code or name..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="bg-white shadow-sm pl-9"
                                />
                            </div>
                            {isSearch && (
                                <Button variant="ghost" size="sm" asChild className="h-9">
                                    <Link href="/accounting/coa">Reset</Link>
                                </Button>
                            )}
                        </form>

                        {!isSearch && (
                            <div className="flex gap-2 ml-auto">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setAllExpanded(true)}
                                    className="h-9 px-3 text-xs font-semibold"
                                >
                                    <ChevronLast className="mr-2 h-4 w-4" />
                                    Expand All
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setAllExpanded(false)}
                                    className="h-9 px-3 text-xs font-semibold"
                                >
                                    <ChevronFirst className="mr-2 h-4 w-4" />
                                    Collapse All
                                </Button>
                            </div>
                        )}
                    </div>

                    <Card className="shadow-md overflow-hidden border-slate-200 p-0">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-[180px] font-bold text-slate-700">Account Code</TableHead>
                                            <TableHead className="font-bold text-slate-700">Account Name</TableHead>
                                            <TableHead className="w-[120px] font-bold text-slate-700">Type</TableHead>
                                            <TableHead className="w-[150px] text-right font-bold text-slate-700">Current Balance</TableHead>
                                            <TableHead className="w-[80px] text-center font-bold text-slate-700">Status</TableHead>
                                            <TableHead className="w-[80px] text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts.length > 0 ? (
                                            isSearch ? (
                                                accounts.map(account => (
                                                    <TableRow 
                                                        key={account.id} 
                                                        className="hover:bg-muted/50 transition-colors cursor-pointer group"
                                                        onClick={() => router.visit(COA.show.url(account.id))}
                                                    >
                                                        <TableCell className="font-mono text-slate-600 font-medium">{account.code}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-slate-900">{account.name}</div>
                                                            {account.parent && (
                                                                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                                                                    Path: {account.parent.code}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={cn("px-2 py-0 border capitalize", typeColors[account.type])}>
                                                                {account.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold">
                                                            <span className={account.balance < 0 ? "text-red-600" : "text-slate-900"}>
                                                                {formatCurrency(account.balance)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {account.is_active ? (
                                                                <div className="h-2 w-2 rounded-full bg-green-500 mx-auto" />
                                                            ) : (
                                                                <div className="h-2 w-2 rounded-full bg-slate-200 mx-auto" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                accounts.map(account => (
                                                    <AccountRow key={account.id} account={account} allExpanded={allExpanded} />
                                                ))
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-48">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <Folder className="h-12 w-12 mb-2 opacity-20" />
                                                        <p>No accounts found in your Chart of Accounts.</p>
                                                        <Button variant="link" asChild className="mt-2">
                                                            <Link href={COA.create.url()}>Create your first account</Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
