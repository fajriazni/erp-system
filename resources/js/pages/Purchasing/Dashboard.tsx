import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Clock, ShoppingCart, CheckCircle, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Head } from '@inertiajs/react';

interface Props {
    kpis: {
        cycle_time: { value: number; unit: string; trend: number; status: string };
        on_time_delivery: { value: number; unit: string; trend: number; status: string };
        qc_pass_rate: { value: number; unit: string; trend: number; status: string };
    };
    currency: string;
}

export default function Dashboard({ kpis, currency }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on_track': return 'text-emerald-500';
            case 'at_risk': return 'text-amber-500';
            case 'critical': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'on_track': return 'success';
            case 'at_risk': return 'warning';
            case 'critical': return 'destructive';
            default: return 'secondary';
        }
    };

    const speedoData = [
        { name: 'On-Time', value: kpis.on_time_delivery.value, fill: '#10b981' },
        { name: 'QC Pass', value: kpis.qc_pass_rate.value, fill: '#3b82f6' },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Strategy & Dashboard' }
        ]}>
            <Head title="Purchasing Dashboard" />
            <div className="container mx-auto space-y-6">
                <PageHeader title="Procurement Strategy & Dashboard" description="High-level insights for decision making and business health." />

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cycle Time (PO to GR)</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.cycle_time.value} <span className="text-sm font-normal text-muted-foreground">{kpis.cycle_time.unit}</span></div>
                            <p className={`text-xs ${kpis.cycle_time.trend < 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
                                {kpis.cycle_time.trend < 0 ? <TrendingDown className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3" />}
                                {Math.abs(kpis.cycle_time.trend)}% from last month
                            </p>
                            <Badge variant={getBadgeVariant(kpis.cycle_time.status) as any} className="mt-2">
                                {kpis.cycle_time.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.on_time_delivery.value} <span className="text-sm font-normal text-muted-foreground">{kpis.on_time_delivery.unit}</span></div>
                            <p className={`text-xs ${kpis.on_time_delivery.trend > 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
                                 {kpis.on_time_delivery.trend > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                                {Math.abs(kpis.on_time_delivery.trend)}% from last month
                            </p>
                             <Badge variant={getBadgeVariant(kpis.on_time_delivery.status) as any} className="mt-2 text-white">
                                {kpis.on_time_delivery.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">QC Pass Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.qc_pass_rate.value} <span className="text-sm font-normal text-muted-foreground">{kpis.qc_pass_rate.unit}</span></div>
                            <p className={`text-xs ${kpis.qc_pass_rate.trend > 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
                                 {kpis.qc_pass_rate.trend > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                                {Math.abs(kpis.qc_pass_rate.trend)}% from last month
                            </p>
                            <Badge variant={getBadgeVariant(kpis.qc_pass_rate.status) as any} className="mt-2 text-white">
                                {kpis.qc_pass_rate.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Visualizations */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Vendor Performance Overview</CardTitle>
                            <CardDescription>
                                Visualization of key vendor success metrics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                             <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={speedoData}>
                                        <RadialBar
                                            // minAngle={15}
                                            label={{ position: 'insideStart', fill: '#fff' }}
                                            background
                                            dataKey="value"
                                        />
                                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{top: '50%', right: 0, transform: 'translate(0, -50%)', lineHeight: '24px'}} />
                                        <Tooltip />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Action Items</CardTitle>
                            <CardDescription>Recommended actions based on KPIs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Audit Vendor X</p>
                                        <p className="text-xs text-muted-foreground">QC Rate dropped below 95% threshold.</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start">
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-emerald-500" />
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Reward Vendor Y</p>
                                        <p className="text-xs text-muted-foreground">Consistently achieved 100% On-Time Delivery.</p>
                                    </div>
                                </div>
                                 <Separator />
                                <div className="flex items-start">
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-red-500" />
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Review Contract Z</p>
                                        <p className="text-xs text-muted-foreground">Maverick buying detected in IT category.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
