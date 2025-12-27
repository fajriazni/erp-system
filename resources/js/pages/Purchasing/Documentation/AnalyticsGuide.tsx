import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Info, BarChart, TrendingUp, AlertTriangle, PieChart, Clock, LineChart, Activity
} from 'lucide-react';

export default function AnalyticsGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '/purchasing/documentation' },
            { title: 'Analytics & Reporting', href: '#' }
        ]}>
            <Head title="Analytics & Reporting Guide" />

            <div className="container mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Strategic Reporting</h1>
                    <p className="text-muted-foreground text-lg">
                       Data-driven insights for smarter procurement decisions.
                    </p>
                </div>

                <Tabs defaultValue="spend" className="w-full">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Contents</h2>
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                    <TabsTrigger value="spend" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Spend Analysis
                                    </TabsTrigger>
                                    <TabsTrigger value="variance" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Price Variance detection
                                    </TabsTrigger>
                                    <TabsTrigger value="aging" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        PO Aging & Performance
                                    </TabsTrigger>
                                    <TabsTrigger value="prmonitor" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        PR Monitor
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                            {/* Spend Analysis */}
                            <TabsContent value="spend" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" /> Spend Analysis</CardTitle>
                                        <CardDescription>Visualize where money is going.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            The Spend Dashboard aggregates data from posted bills and purchase orders to show:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                            <li><strong>Spend by Category:</strong> Identify high-cost categories (e.g., Raw Materials vs. Office Supplies).</li>
                                            <li><strong>Spend by Vendor:</strong> See your top 10 suppliers by volume (Pareto analysis).</li>
                                            <li><strong>Time Trends:</strong> Monthly spend velocity to detect seasonality.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Price Variance */}
                            <TabsContent value="variance" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Price Variance</CardTitle>
                                        <CardDescription>Detect cost leakage between Order and Invoice.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                            <h4 className="font-medium text-red-800">What is Variance?</h4>
                                            <p className="text-sm text-red-700">
                                                Variance occurs when the <strong>Billed Price</strong> is higher than the <strong>PO Price</strong>.
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            The Variance Report highlights discrepancies above a configured threshold (default 5%). Use this to negotiate credits or update standard costs.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PO Aging */}
                            <TabsContent value="aging" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> PO Aging & Delivery Performance</CardTitle>
                                        <CardDescription>Monitor open orders and vendor timeliness.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Aging Buckets</h4>
                                                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                                    <li><span className="text-green-600 font-medium">0-7 Days:</span> Recent</li>
                                                    <li><span className="text-yellow-600 font-medium">8-30 Days:</span> At Risk</li>
                                                    <li><span className="text-red-600 font-medium">&gt;30 Days:</span> Critical / Late</li>
                                                </ul>
                                            </div>
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Vendor Scorecard</h4>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    On-time delivery performance is calculated automatically based on "Expected Date" vs. "Goods Receipt Date".
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                             {/* Compliance */}
                             <TabsContent value="compliance" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" /> Contract Compliance</CardTitle>
                                        <CardDescription>Detecting Maverick Spend.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            Identifies purchases made <strong>outside of established contracts</strong> (Maverick Spend).
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            It compares direct POs against existing Purchase Agreements for the same items/vendors, highlighting missed savings opportunities.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PR Monitor */}
                            <TabsContent value="prmonitor" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> PR Monitor</CardTitle>
                                        <CardDescription>Tracking requisition velocity and bottlenecks.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            The PR Monitor gives a high-level view of all Purchase Requisitions in the pipeline, highlighting:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                            <li><strong>Pending Approval:</strong> PRs waiting for management sign-off.</li>
                                            <li><strong>Processing Turnaround:</strong> Average time from Approval to PO Conversion.</li>
                                            <li><strong>Stalled Requests:</strong> PRs that have been open for &gt; 14 days without action.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
