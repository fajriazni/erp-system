import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, AlertTriangle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
    data: {
        counts: Record<string, number>;
        avg_approval_days: number;
        bottleneck_department: string;
    };
    currency: string;
}

export default function PrMonitor({ data, currency }: Props) {
    
    const chartData = [
        { name: 'Draft', value: data.counts.draft || 0, color: '#94a3b8' },
        { name: 'Submitted', value: data.counts.submitted || 0, color: '#3b82f6' },
        { name: 'Approved', value: data.counts.approved || 0, color: '#22c55e' },
        { name: 'Converted', value: data.counts.converted || 0, color: '#8b5cf6' },
        { name: 'Rejected', value: data.counts.rejected || 0, color: '#ef4444' },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Analytics', href: '/purchasing/analytics/pr-monitor' },
            { title: 'PR Monitor' }
        ]}>
            <Head title="PR Monitor" />
            <div className="container mx-auto space-y-6">
                <PageHeader title="PR Monitor" description="Real-time tracking of purchase requisitions to prevent bottlenecks." />

                <div className="grid gap-4 md:grid-cols-3">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ (data.counts.submitted || 0) }</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Approval Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.avg_approval_days} Days</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Time from submission to approval
                            </p>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Bottleneck</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.bottleneck_department}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Department with most delayed approvals
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                     <CardHeader>
                        <CardTitle>Request Pipeline</CardTitle>
                        <CardDescription>Volume of requests at each stage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Requests" radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Simulated List of recent stuck PRs could go here */}
            </div>
        </AppLayout>
    );
}
