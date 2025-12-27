import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    currentPeriod: {
        period: string;
        status: string;
        days_remaining: number;
    };
    closingChecklist: Array<{
        task: string;
        status: string;
    }>;
}

export default function Index({ currentPeriod, closingChecklist }: Props) {
    const handleClosePeriod = () => {
        if (confirm(`Close period ${currentPeriod.period}? This action cannot be undone.`)) {
            router.post('/accounting/closing/close', { period: currentPeriod.period });
        }
    };

    return (
        <>
            <Head title="Period Closing" />
            
            <PageHeader
                title="Period Closing"
                description="Monthly/Year-end closing workflow"
            />

            <div className="grid gap-6 md:grid-cols-2 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="text-3xl font-bold">{currentPeriod.period}</div>
                                <div className="mt-2">
                                    <Badge variant={currentPeriod.status === 'open' ? 'default' : 'secondary'}>
                                        {currentPeriod.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            {currentPeriod.status === 'open' && (
                                <div className="text-sm text-muted-foreground">
                                    {currentPeriod.days_remaining} days remaining to close
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Closing Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {closingChecklist.map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    {item.status === 'completed' ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    )}
                                    <span className={item.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                        {item.task}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Period Closing Actions</CardTitle>
                        <Button 
                            onClick={handleClosePeriod}
                            variant="destructive"
                            disabled={currentPeriod.status !== 'open'}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            Close Period
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Warning:</strong> Closing a period will lock all transactions for that period and prevent further modifications. 
                            Ensure all checklist items are completed before proceeding.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
