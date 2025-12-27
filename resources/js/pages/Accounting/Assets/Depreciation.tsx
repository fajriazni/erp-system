import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    summary: {
        total_assets: number;
        accumulated_depreciation: number;
        net_book_value: number;
        current_month_depreciation: number;
    };
    methods: Record<string, string>;
}

export default function Depreciation({ summary, methods }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleRunDepreciation = () => {
        const period = prompt('Enter period (YYYY-MM):', new Date().toISOString().slice(0, 7));
        if (period) {
            router.post('/accounting/depreciation/run', { period });
        }
    };

    return (
        <>
            <Head title="Asset Depreciation" />
            
            <PageHeader
                title="Asset Depreciation"
                description="Calculate and manage asset depreciation"
            />

            <div className="grid gap-6 md:grid-cols-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary?.total_assets || 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Accumulated Depreciation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary?.accumulated_depreciation || 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Net Book Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary?.net_book_value || 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Current Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary?.current_month_depreciation || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Depreciation Runner</CardTitle>
                        <Button onClick={handleRunDepreciation}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Run Depreciation
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Depreciation Methods Available:</h4>
                            <ul className="space-y-1">
                                {Object.entries(methods || {}).map(([key, name]) => (
                                    <li key={key} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
