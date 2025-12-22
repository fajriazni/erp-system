import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    Info, FileSignature, 
    ClipboardList, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';

export default function ContractsGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '/purchasing/documentation' },
            { title: 'Contracts & Agreements', href: '#' }
        ]}>
            <Head title="Contracts & Agreements Guide" />

            <div className="container mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Contracts & Agreements Guide</h1>
                    <p className="text-muted-foreground text-lg">
                        Managing long-term vendor relationships, negotiated pricing, and recurring supply commitments.
                    </p>
                </div>

                {/* Overview Alert */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Strategic Sourcing</AlertTitle>
                    <AlertDescription>
                        Contracts allow you to lock in prices and terms for a specific period or volume, reducing administrative overhead and ensuring supply stability.
                    </AlertDescription>
                </Alert>

                <Tabs defaultValue="agreements" className="w-full">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    Contents
                                </h2>
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                    <TabsTrigger 
                                        value="agreements" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Purchase Agreements
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="blanket" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Blanket Orders (BPO)
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                            {/* Purchase Agreements Tab */}
                            <TabsContent value="agreements" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileSignature className="h-5 w-5 text-primary" />
                                            Purchase Agreements
                                        </CardTitle>
                                        <CardDescription>
                                            Framework agreements defining terms and conditions for future purchases.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Agreement Types</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-1">Call-Off Orders</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Agreements where goods are ordered in batches over time against a master contract.
                                                    </p>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-1">Standard Contracts</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Fixed-scope contracts for one-time or defined projects.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Key Features</h3>
                                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                                <li><strong>Vendor Selection:</strong> Link agreements to onboarded vendors.</li>
                                                <li><strong>Date Range:</strong> Specify valid from/to dates for the contract terms.</li>
                                                <li><strong>Payment Terms:</strong> Pre-define payment schedules (e.g., Net 30, 50% Upfront).</li>
                                                <li><strong>Document Storage:</strong> Attach signed PDF contracts directly to the record.</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Blanket Orders Tab */}
                            <TabsContent value="blanket" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5 text-primary" />
                                            Blanket Purchase Orders (BPO)
                                        </CardTitle>
                                        <CardDescription>
                                            Long-term orders for recurring goods with scheduled "Call-Offs".
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">How BPOs Work</h3>
                                            <p className="text-sm text-muted-foreground">
                                                A Blanket Order sets a total quantity or value limit for a specific period. You do not receive everything at once; instead, you issue "Call-Offs" (Drawdowns) as needed.
                                            </p>
                                            
                                            <div className="flex items-center gap-2 text-sm flex-wrap bg-muted p-4 rounded-lg">
                                                <Badge variant="outline">Draft</Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">Active</Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700">Partially Ordered</Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline" className="bg-green-50 text-green-700">Detailed / Filled</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Managing Quotas</h3>
                                            <div className="bg-muted/30 p-4 rounded-lg border">
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-muted-foreground">Total Agreement</div>
                                                        <div className="text-xl font-bold">1,000 Units</div>
                                                    </div>
                                                    <div className="border-l border-r">
                                                        <div className="text-sm font-medium text-muted-foreground">Called Off</div>
                                                        <div className="text-xl font-bold text-blue-600">450 Units</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-muted-foreground">Remaining</div>
                                                        <div className="text-xl font-bold text-green-600">550 Units</div>
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-center text-xs text-muted-foreground">
                                                    The system automatically tracks call-offs and prevents ordering more than the agreed remaining quantity.
                                                </p>
                                            </div>
                                        </div>

                                        <Alert className="border-yellow-600 bg-yellow-50 text-yellow-900">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <AlertTitle>Expiration Alerts</AlertTitle>
                                            <AlertDescription>
                                                BPOs automatically flag as "Expired" if the end date passes, even if quota remains.
                                            </AlertDescription>
                                        </Alert>
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
// Force Refresh
