import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Info, Undo2, Receipt, HelpCircle, FileWarning, ArrowRightLeft, CreditCard
} from 'lucide-react';

export default function ReturnsClaimsGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '/purchasing/documentation' },
            { title: 'Returns & Claims', href: '#' }
        ]}>
            <Head title="Returns & Claims User Guide" />

            <div className="container mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Returns & Claims User Guide</h1>
                    <p className="text-muted-foreground text-lg">
                       Handling product returns, financial adjustments (Debit Notes), and vendor disputes.
                    </p>
                </div>

                <Alert className="border-blue-600 bg-blue-50 text-blue-900">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Integrated Workflow</AlertTitle>
                    <AlertDescription>
                        Returns logic is integrated with Inventory (Stock Out) and Accounting (Debit Note). Always start from the purchase document to ensure traceability.
                    </AlertDescription>
                </Alert>

                <Tabs defaultValue="returns" className="w-full">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Contents</h2>
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                    <TabsTrigger value="returns" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Purchase Returns (RMA)
                                    </TabsTrigger>
                                    <TabsTrigger value="debit" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Debit Notes
                                    </TabsTrigger>
                                    <TabsTrigger value="claims" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Vendor Claims
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                            {/* Purchase Returns */}
                            <TabsContent value="returns" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Undo2 className="h-5 w-5 text-primary" /> Purchase Returns (RMA)</CardTitle>
                                        <CardDescription>Returning goods to vendors due to defects or excess.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            A Purchase Return is created when received goods are rejected during QC or found defective later. 
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Creation Methods</h4>
                                                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                                    <li><strong>From Goods Receipt:</strong> Return specific lines from a GR.</li>
                                                    <li><strong>Manual Entry:</strong> Create a standalone return (requires manual lot selection).</li>
                                                </ul>
                                            </div>
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Inventory Impact</h4>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Validating a return creates an <strong>Outgoing Shipment</strong>, reducing "On Hand" stock.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Debit Notes */}
                            <TabsContent value="debit" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Debit Notes</CardTitle>
                                        <CardDescription>Requesting refunds or credit from the vendor.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            A Debit Note formalizes that the vendor owes you money. It is the opposite of a Vendor Bill.
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <h4 className="font-medium mb-2">Usage Scenarios</h4>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                <li><strong>Returns:</strong> You returned goods and need a refund for the billed amount.</li>
                                                <li><strong>Price Correction:</strong> You were overcharged on an invoice.</li>
                                                <li><strong>Discounts:</strong> Agile retrospective discount applied after billing.</li>
                                            </ul>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Debit Notes can be <strong>allocated</strong> to reduce future payments to the vendor.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Vendor Claims */}
                            <TabsContent value="claims" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /> Vendor Claims</CardTitle>
                                        <CardDescription>Managing disputes and warranty issues.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            Use Vendor Claims for issues that may not immediately result in a product return, such as:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                            <li><strong>Short Quality:</strong> Product works but is below grade.</li>
                                            <li><strong>Late Delivery Penalties:</strong> Claiming fees for delayed shipments.</li>
                                            <li><strong>Warranty:</strong> Service requests for purchased assets.</li>
                                        </ul>
                                        <div className="flex items-center gap-2 mt-4 p-3 border rounded-md bg-yellow-50 text-yellow-900 border-yellow-200">
                                            <FileWarning className="h-4 w-4" />
                                            <span className="text-sm">Claims can be converted to <strong>Debit Notes</strong> if a financial compensation is agreed upon.</span>
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
