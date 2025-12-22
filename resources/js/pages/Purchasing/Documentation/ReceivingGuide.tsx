import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    Info, PackageCheck, Truck, ShieldCheck, Undo2, Calculator
} from 'lucide-react';

export default function ReceivingGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '/purchasing/documentation' },
            { title: 'Receiving & QC', href: '#' }
        ]}>
            <Head title="Receiving & QC Guide" />

            <div className="container mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Receiving & Quality Control Guide</h1>
                    <p className="text-muted-foreground text-lg">
                       Managing inbound logistics, quality inspections, and inventory updates.
                    </p>
                </div>

                <Tabs defaultValue="receipts" className="w-full">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Contents</h2>
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                    <TabsTrigger value="receipts" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Goods Receipts (GR)
                                    </TabsTrigger>
                                    <TabsTrigger value="qc" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Quality Inspection
                                    </TabsTrigger>
                                    <TabsTrigger value="returns" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Vendor Returns
                                    </TabsTrigger>
                                    <TabsTrigger value="landed" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Landed Costs
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                            {/* Goods Receipts */}
                            <TabsContent value="receipts" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Goods Receipt (GR)</CardTitle>
                                        <CardDescription>Recording the arrival of items into inventory.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            A GR is always linked to a Purchase Order. It updates stock levels and triggers the accrual for Accounts Payable.
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Partial Receiving</h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    You can receive a partial quantity of a PO line. The system keeps the PO open until the remaining quantity is delivered or cancelled.
                                                </p>
                                            </div>
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Auto-Inventory Update</h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Upon validation, stock moves from "Incoming" to "On Hand" in the specified warehouse zone.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Quality Control */}
                            <TabsContent value="qc" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Quality Inspection</CardTitle>
                                        <CardDescription>Verifying that received goods meet specifications.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                            <h4 className="font-medium text-orange-800">Inspection Trigger</h4>
                                            <p className="text-sm text-orange-700">
                                                Products flagged as "Requires QC" are placed in a <strong>Holding Area</strong> upon receipt. They cannot be sold or used until they pass inspection.
                                            </p>
                                        </div>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                            <li><strong>Pass:</strong> Move to available stock.</li>
                                            <li><strong>Fail:</strong> Quarantine for Return to Vendor or Scrap.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Vendor Returns */}
                            <TabsContent value="returns" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Undo2 className="h-5 w-5 text-primary" /> Vendor Returns</CardTitle>
                                        <CardDescription>Returning defective or excess goods.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            Initiate a return from a specific Goods Receipt. This creates a "Return Order" and (optionally) a Debit Note request for a refund.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Landed Costs */}
                            <TabsContent value="landed" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Landed Cost Allocation</CardTitle>
                                        <CardDescription>Distributing freight/customs costs to item valuation.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            Allocate additional bills (freight, duties) to a specific GR to update the Weighted Average Cost (WAC) of the items, ensuring accurate margin analysis.
                                        </p>
                                        <div className="flex gap-2">
                                            <Badge variant="outline">By Value</Badge>
                                            <Badge variant="outline">By Quantity</Badge>
                                            <Badge variant="outline">By Weight</Badge>
                                            <Badge variant="outline">By Volume</Badge>
                                        </div>
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
