import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    Info, ShoppingCart, 
    ClipboardList, ArrowRight, Gavel, Users
} from 'lucide-react';

export default function PurchasingOperationsGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '#' },
            { title: 'Operations User Guide', href: '#' }
        ]}>
            <Head title="Purchasing Operations User Guide - REQ & RFQ" />

            <div className="container mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Purchasing Operations User Guide</h1>
                    <p className="text-muted-foreground text-lg">
                        Guide for day-to-day purchasing activities: Requisitions, RFQs, and Orders.
                    </p>
                </div>

                {/* Overview Alert */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>About This Guide</AlertTitle>
                    <AlertDescription>
                        This guide covers the operational workflows including creating Purchase Requests (PR) 
                        and managing Request for Quotations (RFQ).
                    </AlertDescription>
                </Alert>

                <Tabs defaultValue="reqs" className="w-full">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    Contents
                                </h2>
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                    <TabsTrigger 
                                        value="reqs" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Purchase Requisitions
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="rfqs" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        RFQ Management
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                            {/* Purchase Requisitions Tab */}
                            <TabsContent value="reqs" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Purchase Requisitions (PR)</CardTitle>
                                        <CardDescription>Internal requests for goods and services</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Workflow</h3>
                                            <div className="flex items-center gap-2 text-sm flex-wrap bg-muted p-4 rounded-lg">
                                                <Badge variant="outline">Draft</Badge>
                                                <ArrowRight className="h-3 w-3" />
                                                <Badge variant="outline">Submitted</Badge>
                                                <ArrowRight className="h-3 w-3" />
                                                <Badge variant="outline">Approved</Badge>
                                                <ArrowRight className="h-3 w-3" />
                                                <Badge variant="outline">Converted to PO</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Key Functions</h3>
                                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                                <li>**Create Request**: Staff can request items needed for operations.</li>
                                                <li>**Add Items**: Specify product, quantity, and required date.</li>
                                                <li>**Submission**: Send for manager approval.</li>
                                                <li>**Approval**: Managers review budget and necessity.</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* RFQs Tab (Moved from SRM) */}
                            <TabsContent value="rfqs" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>RFQ Management</CardTitle>
                                        <CardDescription>Create, manage, and award Requests for Quotation</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Workflow Overview</h3>
                                            <div className="flex items-center gap-2 text-sm flex-wrap bg-muted p-4 rounded-lg">
                                                <Badge variant="outline">Draft</Badge>
                                                <ArrowRight className="h-3 w-3" />
                                                <Badge variant="outline">Open (Receive Bids)</Badge>
                                                <ArrowRight className="h-3 w-3" />
                                                <Badge variant="outline">Closed (Selection)</Badge>
                                                <ArrowRight className="h-3 w-3" />
                                                <Badge variant="outline">Awarded</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Key Features</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="border rounded-lg p-4">
                                                    <div className="flex items-center gap-2 font-medium mb-2">
                                                        <Gavel className="h-4 w-4 text-primary" />
                                                        Create RFQ
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Start a new sourcing event by defining items, quantities, and target prices.
                                                    </p>
                                                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                                                        <li>Set deadlines for vendor submissions</li>
                                                        <li>Invite specific vendors or open to all</li>
                                                        <li>Attach specifications and requirements</li>
                                                    </ul>
                                                </div>
                                                <div className="border rounded-lg p-4">
                                                    <div className="flex items-center gap-2 font-medium mb-2">
                                                        <Users className="h-4 w-4 text-primary" />
                                                        Vendor Interaction
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Vendors receive invitations and can submit bids directly.
                                                    </p>
                                                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                                                        <li>Track invitation status (Sent/Responded)</li>
                                                        <li>Record manual bids for offline vendors</li>
                                                        <li>System automatically calculates totals</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Comparison & Awarding</h3>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <p>
                                                    The <strong>Comparison Table</strong> automatically highlights the best price for each item and the lowest total bid.
                                                </p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li><span className="text-green-600 font-medium">Green Highlights</span> indicate the lowest unit price per item.</li>
                                                    <li><span className="font-medium">Crown Icon</span> marks the winning vendor after awarding.</li>
                                                    <li>Use the <strong>"Award"</strong> button to finalize a selection and generate a Draft PO.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </div>
                    </div>
                </Tabs>

                {/* Footer */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Need Help?</AlertTitle>
                    <AlertDescription>
                        For questions or support with Purchasing Operations, contact your Purchasing Manager.
                    </AlertDescription>
                </Alert>
            </div>
        </AppLayout>
    );
}
