import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RatioItem {
    value: number;
    description: string;
    benchmark: string;
    status: 'good' | 'warning';
    unit?: string;
}

interface RatioCategory {
    [key: string]: RatioItem;
}

interface Ratios {
    liquidity: RatioCategory;
    leverage: RatioCategory;
    profitability: RatioCategory;
}

interface TrendData {
    month: string;
    label: string;
    current_ratio: number;
    debt_to_equity: number;
    roe: number;
}

interface Props {
    ratios: Ratios;
    trends: TrendData[];
}

export default function Ratios({ ratios, trends }: Props) {
    const renderRatioCard = (title: string, ratioItem: RatioItem) => {
        const isGood = ratioItem.status === 'good';
        
        return (
            <Card key={title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {isGood ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold ${isGood ? 'text-green-600' : 'text-yellow-600'}`}>
                        {ratioItem.value}{ratioItem.unit || ''}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {ratioItem.description}
                    </p>
                    <p className="text-xs font-medium mt-2">
                        Benchmark: {ratioItem.benchmark}
                    </p>
                </CardContent>
            </Card>
        );
    };

    const formatTitle = (key: string): string => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <>
            <Head title="Financial Ratios" />
            
            <PageHeader
                title="Financial Ratios"
                description="Key financial ratios and performance indicators"
            />

            <div className="space-y-8">
                {/* Liquidity Ratios */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Liquidity Ratios</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.entries(ratios.liquidity).map(([key, ratio]) =>
                            renderRatioCard(formatTitle(key), ratio)
                        )}
                    </div>
                </div>

                {/* Leverage Ratios */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Leverage Ratios</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.entries(ratios.leverage).map(([key, ratio]) =>
                            renderRatioCard(formatTitle(key), ratio)
                        )}
                    </div>
                </div>

                {/* Profitability Ratios */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Profitability Ratios</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        {Object.entries(ratios.profitability).map(([key, ratio]) =>
                            renderRatioCard(formatTitle(key), ratio)
                        )}
                    </div>
                </div>

                {/* Historical Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Historical Trends</CardTitle>
                        <CardDescription>Last 6 months ratio trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Period</th>
                                        <th className="text-right py-2">Current Ratio</th>
                                        <th className="text-right py-2">Debt-to-Equity</th>
                                        <th className="text-right py-2">ROE (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trends.map((trend, index) => (
                                        <tr key={index} className="border-b hover:bg-muted/50">
                                            <td className="py-2">{trend.label}</td>
                                            <td className="py-2 text-right">
                                                <span className="flex items-center justify-end gap-1">
                                                    {trend.current_ratio.toFixed(2)}
                                                    {index > 0 && trend.current_ratio > trends[index - 1].current_ratio && (
                                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                                    )}
                                                    {index > 0 && trend.current_ratio < trends[index - 1].current_ratio && (
                                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-2 text-right">
                                                <span className="flex items-center justify-end gap-1">
                                                    {trend.debt_to_equity.toFixed(2)}
                                                    {index > 0 && trend.debt_to_equity < trends[index - 1].debt_to_equity && (
                                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                                    )}
                                                    {index > 0 && trend.debt_to_equity > trends[index - 1].debt_to_equity && (
                                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-2 text-right">
                                                <span className="flex items-center justify-end gap-1">
                                                    {trend.roe.toFixed(2)}%
                                                    {index > 0 && trend.roe > trends[index - 1].roe && (
                                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                                    )}
                                                    {index > 0 && trend.roe < trends[index - 1].roe && (
                                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
