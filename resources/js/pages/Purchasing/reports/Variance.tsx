import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, AlertTriangle, Users } from 'lucide-react';

interface Props {
    summary: {
        total_variance_amount: number;
        average_variance_percent: number;
        high_variance_count: number;
        affected_vendors: number;
    };
    details: any[];
    chartData: any[];
    currency: string;
}

export default function PriceVariance({ summary, details, chartData, currency }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Reports', href: '/purchasing/reports' },
            { title: 'Price Variance' }
        ]}>
            <Head title="Price Variance Analysis" />
            
            <div className="container mx-auto space-y-6">
                <PageHeader
                    title="Price Variance Analysis"
                    description="Monitor and analyze price differences between Purchase Orders and Vendor Invoices"
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Variance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(summary.total_variance_amount)}
                                </div>
                                <DollarSign className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Average Variance %</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {summary.average_variance_percent.toFixed(2)}%
                                </div>
                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>High Variance Items</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {summary.high_variance_count}
                                </div>
                                <AlertTriangle className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Affected Vendors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {summary.affected_vendors}
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart */}
                {chartData && chartData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 Products with Highest Variance</CardTitle>
                            <CardDescription>Products with the greatest price differences</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="product" />
                                    <YAxis />
                                    <Tooltip formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value)} />
                                    <Legend />
                                    <Bar dataKey="variance" fill="#f59e0b" name="Variance Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Placeholder for Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Variance Details</CardTitle>
                        <CardDescription>
                            Detailed breakdown of price variances
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Invoice Number</TableHead>
                                    <TableHead className="text-right">PO Amount</TableHead>
                                    <TableHead className="text-right">Invoice Amount</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                    <TableHead className="text-right">Variance %</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {details.length > 0 ? (
                                    details.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.vendor_name}</TableCell>
                                            <TableCell>{item.po_number}</TableCell>
                                            <TableCell>{item.invoice_number}</TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: currency
                                                }).format(item.po_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: currency
                                                }).format(item.invoice_amount)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-red-600">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: currency
                                                }).format(item.variance_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="destructive">
                                                    {item.variance_percent}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No price variances found.
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
