import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertOctagon, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
    summary: {
        total_open: number;
        critical: number;
        at_risk: number;
        on_track: number;
    };
    details: any[];
    chartData: any[];
    currency: string;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

export default function OpenPoAging({ summary, details, chartData, currency }: Props) {
    const agingData = [
        { name: 'Critical (>30 days)', value: summary.critical, color: '#ef4444' },
        { name: 'At Risk (15-30 days)', value: summary.at_risk, color: '#f59e0b' },
        { name: 'On Track (<15 days)', value: summary.on_track, color: '#10b981' },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Reports', href: '/purchasing/reports' },
            { title: 'PO Aging' }
        ]}>
            <Head title="Open PO Aging Report" />
            
            <div className="container mx-auto space-y-6">
                <PageHeader
                    title="Open PO Aging Report"
                    description="Track purchase orders with delayed or incomplete deliveries"
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Open POs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {summary.total_open}
                                </div>
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50/50">
                        <CardHeader className="pb-2">
                            <CardDescription>Critical (&gt;30 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-red-600">
                                    {summary.critical}
                                </div>
                                <AlertOctagon className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50/50">
                        <CardHeader className="pb-2">
                            <CardDescription>At Risk (15-30 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-orange-600">
                                    {summary.at_risk}
                                </div>
                                <AlertTriangle className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50/50">
                        <CardHeader className="pb-2">
                            <CardDescription>On Track (&lt;15 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-green-600">
                                    {summary.on_track}
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Donut Chart */}
                {summary.total_open > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>PO Distribution by Aging Category</CardTitle>
                            <CardDescription>Visual breakdown of PO aging status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={agingData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={140}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {agingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Placeholder for Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aging Details</CardTitle>
                        <CardDescription>
                            Detailed breakdown of open purchase orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Days Old</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Aging Category</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {details.length > 0 ? (
                                    details.map((po, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{po.po_number}</TableCell>
                                            <TableCell>{po.vendor}</TableCell>
                                            <TableCell>{po.created_date}</TableCell>
                                            <TableCell>{po.days_old} days</TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: currency
                                                }).format(po.outstanding_value)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="uppercase text-xs" >
                                                    {po.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={
                                                        po.aging_category === 'critical' ? 'destructive' :
                                                        po.aging_category === 'at_risk' ? 'warning' :
                                                        'success'
                                                    }
                                                    className="uppercase text-xs"
                                                >
                                                    {po.aging_category.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No open purchase orders found.
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
