import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';

interface Props {
    trendData: any[];
    categoryData: any[];
    vendorData: any[];
    insights: {
        peak_month?: string;
        avg_monthly_spend?: number;
        yoy_growth?: number;
        top_category?: string;
    };
    months: number;
    currency: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function HistoryAnalytics({ trendData, categoryData, vendorData, insights, months, currency }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Reports', href: '/purchasing/reports' },
            { title: 'History Analytics' }
        ]}>
            <Head title="Historical Purchase Analytics" />
            
            <div className="container mx-auto space-y-6">
                <PageHeader
                    title="Historical Purchase Analytics"
                    description={`Trend analysis and insights from the last ${months} months of purchasing data`}
                />

                {/* Key Insights Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Peak Purchase Month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-bold">
                                    {insights.peak_month || 'N/A'}
                                </div>
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Avg Monthly Spend</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-bold">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(insights.avg_monthly_spend || 0)}
                                </div>
                                <DollarSign className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>YoY Growth Rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-bold">
                                    {(insights.yoy_growth || 0).toFixed(1)}%
                                </div>
                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Top Category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-bold">
                                    {insights.top_category || 'N/A'}
                                </div>
                                <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Spend Trend */}
                {trendData && trendData.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Spend Trend</CardTitle>
                            <CardDescription>Purchase spending over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Total Spend" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Spend Trend</CardTitle>
                            <CardDescription>Purchase spending over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                                <p className="text-lg font-medium">No historical data available</p>
                                <p className="text-sm mt-2">
                                    Historical analytics requires at least 3 months of completed purchase orders.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Category & Vendor Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Breakdown */}
                    {categoryData && categoryData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Spend by Category</CardTitle>
                                <CardDescription>Purchase distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Top Vendors */}
                    {vendorData && vendorData.length >0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Top 5 Vendors by Spend</CardTitle>
                                <CardDescription>Highest spending vendors</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={vendorData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="vendor" type="category" width={100} />
                                        <Tooltip formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value)} />
                                        <Bar dataKey="amount" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
