import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface PLStatement {
    revenue: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    gross_margin: number;
    operating_expenses: number;
    operating_income: number;
    operating_margin: number;
    other_income: number;
    other_expenses: number;
    net_income: number;
    net_margin: number;
}

interface AccountBreakdown {
    account_id: number;
    account_code: string;
    account_name: string;
    amount: number;
    percentage: number;
}

interface MonthlyTrend {
    month: string;
    label: string;
    revenue: number;
    expenses: number;
    net_income: number;
}

interface PeriodData {
    revenue: number;
    expenses: number;
    net_income: number;
}

interface Comparison {
    current: PeriodData;
    previous: PeriodData;
    variance: {
        revenue: number;
        revenue_pct: number;
        expenses: number;
        expenses_pct: number;
        net_income: number;
        net_income_pct: number;
    };
}

interface Props {
    plStatement: PLStatement;
    revenueBreakdown: AccountBreakdown[];
    expenseBreakdown: AccountBreakdown[];
    monthlyTrends: MonthlyTrend[];
    comparison: Comparison;
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function PL({ plStatement, revenueBreakdown, expenseBreakdown, monthlyTrends, comparison, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/accounting/analytics/pl', {
            start_date: startDate,
            end_date: endDate,
        });
    };

    return (
        <>
            <Head title="P&L Analytics" />
            
            <PageHeader
                title="P&L Analytics"
                description="Profit & Loss statement with detailed analysis"
            />

            <div className="space-y-6">
                {/* Date Range Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle>Period Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <Button type="submit">Apply</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* P&L Statement Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profit & Loss Statement</CardTitle>
                        <CardDescription>
                            {startDate} to {endDate}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium">Revenue</span>
                                <span className="font-bold text-green-600">{formatCurrency(plStatement.revenue)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center border-b pb-2 font-bold">
                                <span>Gross Profit</span>
                                <span className="text-green-600">
                                    {formatCurrency(plStatement.gross_profit)} ({plStatement.gross_margin}%)
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium">Operating Expenses</span>
                                <span className="font-bold text-red-600">({formatCurrency(plStatement.operating_expenses)})</span>
                            </div>
                            
                            <div className="flex justify-between items-center border-b pb-2 font-bold">
                                <span>Operating Income</span>
                                <span className={plStatement.operating_income >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(plStatement.operating_income)} ({plStatement.operating_margin}%)
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center border-t-2 pt-4 text-lg font-bold">
                                <span>Net Income</span>
                                <span className={plStatement.net_income >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(plStatement.net_income)} ({plStatement.net_margin}%)
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Period Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Period Comparison</CardTitle>
                        <CardDescription>Current vs Previous Period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-2xl font-bold">{formatCurrency(comparison.current.revenue)}</p>
                                <div className="flex items-center gap-1 text-sm">
                                    {comparison.variance.revenue_pct >= 0 ? (
                                        <>
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                                +{comparison.variance.revenue_pct.toFixed(1)}%
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">
                                                {comparison.variance.revenue_pct.toFixed(1)}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Expenses</p>
                                <p className="text-2xl font-bold">{formatCurrency(comparison.current.expenses)}</p>
                                <div className="flex items-center gap-1 text-sm">
                                    {comparison.variance.expenses_pct >= 0 ? (
                                        <>
                                            <TrendingUp className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">
                                                +{comparison.variance.expenses_pct.toFixed(1)}%
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                                {comparison.variance.expenses_pct.toFixed(1)}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Net Income</p>
                                <p className="text-2xl font-bold">{formatCurrency(comparison.current.net_income)}</p>
                                <div className="flex items-center gap-1 text-sm">
                                    {comparison.variance.net_income_pct >= 0 ? (
                                        <>
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                                +{comparison.variance.net_income_pct.toFixed(1)}%
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">
                                                {comparison.variance.net_income_pct.toFixed(1)}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Revenue Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Breakdown</CardTitle>
                            <CardDescription>By Account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {revenueBreakdown.map((item) => (
                                    <div key={item.account_id} className="flex justify-between items-center text-sm">
                                        <span className="truncate flex-1">
                                            {item.account_code} - {item.account_name}
                                        </span>
                                        <span className="font-medium ml-2">
                                            {formatCurrency(item.amount)} ({item.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/*  Expense Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Breakdown</CardTitle>
                            <CardDescription>By Account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {expenseBreakdown.map((item) => (
                                    <div key={item.account_id} className="flex justify-between items-center text-sm">
                                        <span className="truncate flex-1">
                                            {item.account_code} - {item.account_name}
                                        </span>
                                        <span className="font-medium ml-2">
                                            {formatCurrency(item.amount)} ({item.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
