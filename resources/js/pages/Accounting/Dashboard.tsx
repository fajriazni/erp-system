import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Info } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';

interface Metrics {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    revenue: number;
    expenses: number;
    net_income: number;
    current_ratio: number;
}

interface Transaction {
    id: number;
    reference_number: string;
    date: string;
    description: string;
    status: string;
    total_debit: number;
    total_credit: number;
}

interface AlertItem {
    type: 'warning' | 'info';
    title: string;
    message: string;
    action_url: string;
}

interface PeriodData {
    revenue: number;
    expenses: number;
}

interface Props {
    metrics: Metrics;
    recentTransactions: Transaction[];
    alerts: AlertItem[];
    periodComparison: {
        current_period: PeriodData;
        previous_period: PeriodData;
    };
}

export default function Dashboard({ metrics, recentTransactions, alerts, periodComparison }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(
        periodComparison.current_period.revenue,
        periodComparison.previous_period.revenue
    );
    const expenseChange = calculateChange(
        periodComparison.current_period.expenses,
        periodComparison.previous_period.expenses
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }]}>
            <Head title="Accounting Dashboard" />
            
            <PageHeader
                title="Accounting Dashboard"
                description="Financial intelligence and performance metrics"
            />

            <div className="space-y-6">
                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-4">
                        {alerts.map((alert, index) => (
                            <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
                                {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                <AlertTitle>{alert.title}</AlertTitle>
                                <AlertDescription>
                                    {alert.message}
                                    <a href={alert.action_url} className="ml-2 underline">
                                        View Details
                                    </a>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Financial Health Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(metrics.total_assets)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Current Ratio: {metrics.current_ratio.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(metrics.total_liabilities)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Equity: {formatCurrency(metrics.total_equity)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue (Period)</CardTitle>
                            {revenueChange >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(periodComparison.current_period.revenue)}</div>
                            <p className={`text-xs mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last period
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                            {metrics.net_income >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${metrics.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(metrics.net_income)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Expenses: {formatCurrency(periodComparison.current_period.expenses)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Journal Entries</CardTitle>
                        <CardDescription>Latest 10 journal entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTransactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No journal entries found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2">Reference</th>
                                                <th className="text-left py-2">Date</th>
                                                <th className="text-left py-2">Description</th>
                                                <th className="text-left py-2">Status</th>
                                                <th className="text-right py-2">Debit</th>
                                                <th className="text-right py-2">Credit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentTransactions.map((transaction) => (
                                                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                                                    <td className="py-2">
                                                        <a 
                                                            href={`/accounting/journal-entries/${transaction.id}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {transaction.reference_number}
                                                        </a>
                                                    </td>
                                                    <td className="py-2">{transaction.date}</td>
                                                    <td className="py-2 max-w-xs truncate">{transaction.description}</td>
                                                    <td className="py-2">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            transaction.status === 'posted' 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-right">{formatCurrency(transaction.total_debit)}</td>
                                                    <td className="py-2 text-right">{formatCurrency(transaction.total_credit)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
    </AppLayout>
    );
}
