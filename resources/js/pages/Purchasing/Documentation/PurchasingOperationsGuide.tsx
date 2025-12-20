import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    Info, ShoppingCart, 
    ClipboardList, ArrowRight, Gavel, Users, FileText, History, RefreshCcw
} from 'lucide-react';

export default function PurchasingOperationsGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '#' },
            { title: 'Operations User Guide', href: '#' }
        ]}>
            <Head title="Purchasing Operations User Guide" />

            <div className="container mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Purchasing Operations User Guide</h1>
                    <p className="text-muted-foreground text-lg">
                        Guide for day-to-day purchasing activities: Requisitions, RFQs, Orders, and Revisions.
                    </p>
                </div>

                {/* Overview Alert */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>About This Guide</AlertTitle>
                    <AlertDescription>
                        This documentation covers the end-to-end purchasing workflow, from initial request to final order management and version control.
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
                                    <TabsTrigger 
                                        value="orders" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        PO Management
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="direct" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Direct Purchasing
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="versions" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Revisions & Versions
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                            {/* Purchase Requisitions Tab */}
                            <TabsContent value="reqs" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5 text-primary" />
                                            Purchase Requisitions (PR)
                                        </CardTitle>
                                        <CardDescription>Internal requests for goods and services initiated by employees.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Requisition Workflow</h3>
                                            <p className="text-sm text-muted-foreground">
                                                The PR process ensures that all purchases are authorized and budgeted before any commitment is made to a vendor.
                                            </p>
                                            <div className="flex items-center gap-2 text-sm flex-wrap bg-muted p-4 rounded-lg">
                                                <Badge variant="outline" className="bg-background">Draft</Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline" className="bg-background">Submitted</Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="secondary">Converted to PO</Badge>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-primary" />
                                                    Roles & Responsibilities
                                                </h4>
                                                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                                    <li><strong>Requester:</strong> Creates the PR, specifies items, quantities, and required delivery dates.</li>
                                                    <li><strong>Department Head:</strong> Reviews PRs for budget compliance and operational necessity.</li>
                                                    <li><strong>Purchasing Officer:</strong> Receives approved PRs and decides fulfillment strategy (Stock, PO, or RFQ).</li>
                                                </ul>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    Key Features
                                                </h4>
                                                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                                    <li><strong>Catalog Search:</strong> Quickly add standard items from the master product list.</li>
                                                    <li><strong>Budget Check:</strong> (Coming Soon) Automatic warning if department budget is exceeded.</li>
                                                    <li><strong>Attachment Support:</strong> Upload specs, photos, or justifications.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* RFQs Tab */}
                            <TabsContent value="rfqs" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Gavel className="h-5 w-5 text-primary" />
                                            RFQ Management
                                        </CardTitle>
                                        <CardDescription>Competitive bidding process to secure the best value.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        
                                        <div className="border border-l-4 border-l-primary rounded-r-lg p-4 bg-muted/20">
                                            <h3 className="font-semibold mb-2">When to use an RFQ?</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Use an RFQ when the item price is not fixed, the order value is high, or you want to compare multiple vendors for the best terms. For routine, low-value purchases, use <strong>Direct Purchasing</strong>.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">The Sourcing Cycle</h3>
                                            <div className="grid md:grid-cols-4 gap-4">
                                                <div className="border rounded-lg p-3 space-y-2">
                                                    <Badge variant="outline">1. Preparation</Badge>
                                                    <p className="text-xs text-muted-foreground">Define items, specs, and deadline. Select a list of invited vendors.</p>
                                                </div>
                                                <div className="border rounded-lg p-3 space-y-2">
                                                    <Badge variant="outline">2. Bidding</Badge>
                                                    <p className="text-xs text-muted-foreground">RFQ is "Open". Vendors submit quotes via portal or email (manual entry).</p>
                                                </div>
                                                <div className="border rounded-lg p-3 space-y-2">
                                                    <Badge variant="outline">3. Evaluation</Badge>
                                                    <p className="text-xs text-muted-foreground">Compare offers side-by-side. System highlights best price.</p>
                                                </div>
                                                <div className="border rounded-lg p-3 space-y-2">
                                                    <Badge variant="default">4. Award</Badge>
                                                    <p className="text-xs text-muted-foreground">Select winner & convert to PO. Other vendors are notified.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Smart Comparison Features</h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                                                    <h4 className="font-medium text-green-800 text-sm mb-1">Best Price Highlighting</h4>
                                                    <p className="text-xs text-green-700">
                                                        The comparison table automatically flags the lowest unit price for each item in <span className="font-bold">green</span>, making it easy to identify the most cost-effective option per line item.
                                                    </p>
                                                </div>
                                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                                    <h4 className="font-medium text-blue-800 text-sm mb-1">Total Value Calculation</h4>
                                                    <p className="text-xs text-blue-700">
                                                       See the grand total for each vendor, including estimated taxes and delivery fees (if provided), for a true "Landed Cost" comparison.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Orders Tab */}
                            <TabsContent value="orders" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShoppingCart className="h-5 w-5 text-primary" />
                                            Purchase Order (PO) Management
                                        </CardTitle>
                                        <CardDescription>
                                            Managing the central legal documents in the purchasing process.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">PO Lifecycle & Statuses</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <div className="flex items-center gap-2 p-2 border rounded bg-background">
                                                    <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Draft</span>
                                                        <span className="text-[10px] text-muted-foreground">Editable, not sent</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 border rounded bg-background">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Ordered</span>
                                                        <span className="text-[10px] text-muted-foreground">Sent to Vendor</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 border rounded bg-background">
                                                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Partial</span>
                                                        <span className="text-[10px] text-muted-foreground">Partially Received</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 border rounded bg-background">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Received</span>
                                                        <span className="text-[10px] text-muted-foreground">Fully Received</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 border rounded bg-background">
                                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Billed</span>
                                                        <span className="text-[10px] text-muted-foreground">Invoiced by Vendor</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 border rounded bg-background">
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Cancelled</span>
                                                        <span className="text-[10px] text-muted-foreground">Voided</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">PO Identification</h3>
                                            <div className="bg-muted p-4 rounded-lg space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-medium mb-1">Standard Numbering</h4>
                                                    <code className="bg-background px-2 py-1 rounded text-sm border">PO-YYYY-XXXX</code>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Sequential numbering that resets annually (e.g., PO-2025-0042).
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                                    <div>
                                                        <h4 className="text-sm font-medium mb-1">Source: RFQ</h4>
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-900 border-blue-200">RFQ</Badge>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Generated from a competitive bidding process.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium mb-1">Source: Direct</h4>
                                                        <Badge variant="secondary" className="bg-purple-100 text-purple-900 border-purple-200">Direct</Badge>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Created manually for immediate needs.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Accessing & Managing</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Navigate to <strong>Purchasing &gt; Operations &gt; Orders</strong>.
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                                <li>**Search & Filter:** Find POs by vendor, status, or date range.</li>
                                                <li>**Detail View:** View line items, taxes, notes, and approval history.</li>
                                                <li>**PDF Export:** Download official PO documents for signing or emailing.</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Direct Purchasing Tab */}
                            <TabsContent value="direct" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            Direct Purchasing
                                        </CardTitle>
                                        <CardDescription>
                                            Immediate procurement without a formal bidding process.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Creating a Direct PO</h3>
                                            <div className="space-y-4 text-sm text-muted-foreground border-l-2 border-muted pl-4">
                                                <div>
                                                    <span className="font-medium text-foreground">1. Access Form</span>
                                                    <p>Navigate to <strong>Purchasing &gt; Operations &gt; Direct Purchase</strong>.</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-foreground">2. Initial Setup</span>
                                                    <p>Select a <strong>Vendor</strong> from the approved registry and choose the destination <strong>Warehouse</strong>.</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-foreground">3. Add Items</span>
                                                    <p>Search for products by name or code, then enter quantity and price. The system automatically calculates line totals.</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-foreground">4. Financials</span>
                                                    <p>Configure applicable tax rates (VAT, Withholding Tax). Grand totals update in real-time.</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-foreground">5. Submit</span>
                                                    <p>Click "Create Purchase Order" to finalize.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-muted/30 p-4 rounded-lg">
                                                <h4 className="font-medium mb-2">Form Validation</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    The system prevents submission if critical data (like Vendor or valid Items) is missing, ensuring data integrity.
                                                </p>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-lg">
                                                <h4 className="font-medium mb-2">Error Feedback</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Specific, clear error messages are displayed for any invalid inputs to guide you to a successful submission.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Versions Tab */}
                            <TabsContent value="versions" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <History className="h-5 w-5 text-primary" />
                                            Revisions & Versions (Version Control)
                                        </CardTitle>
                                        <CardDescription>
                                            Track revisions, compare changes, and restore previous states.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Understanding Revisions</h3>
                                            <p className="text-sm text-muted-foreground">
                                                A "Revision" or "Version" is a snapshot of the PO at a specific point in time. Look for the <Badge variant="outline" className="mx-1">v#</Badge> badge in the PO header to see the current version.
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                                <li><strong>Version 1:</strong> Created automatically when the PO is first generated.</li>
                                                <li><strong>New Versions:</strong> Automatic snapshots taken whenever a user modifies the PO (e.g., price updates, quantity changes).</li>
                                            </ul>
                                        </div>

                                        <div className="grid gap-4">
                                            <div className="border rounded-lg p-4">
                                                <div className="flex items-center gap-2 font-medium mb-2">
                                                    <History className="h-4 w-4 text-primary" />
                                                    Viewing History
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    In the **PO Detail Page**, click <strong>Actions &gt; Version History</strong>. This opens a timeline showing:
                                                </p>
                                                <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 ml-2">
                                                    <li><strong>Who</strong> made the change</li>
                                                    <li><strong>When</strong> it occurred</li>
                                                    <li><strong>What</strong> changed (Summary)</li>
                                                </ul>
                                            </div>

                                            <div className="border rounded-lg p-4">
                                                <div className="flex items-center gap-2 font-medium mb-2">
                                                    <RefreshCcw className="h-4 w-4 text-primary" />
                                                    Comparison & Restoration
                                                </div>
                                                <div className="space-y-3 text-sm text-muted-foreground">
                                                    <div>
                                                        <strong>Comparing:</strong> Click "Compare" on any history card to see a side-by-side view with <span className="bg-yellow-100 text-yellow-800 px-1 rounded">yellow highlights</span> for modifications and <span className="bg-green-100 text-green-800 px-1 rounded">green</span>/<span className="bg-red-100 text-red-800 px-1 rounded">red</span> for item changes.
                                                    </div>
                                                    <div>
                                                        <strong>Restoring:</strong> If a mistake is made, click "Restore" on a previous version to revert all data to that state. A new "Restored" version is created to track this action.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Global Dashboard</AlertTitle>
                                            <AlertDescription>
                                                Visit <strong>Purchasing &gt; Operations &gt; Version Control</strong> for a high-level view of all system revisions, metrics, and activity feeds.
                                            </AlertDescription>
                                        </Alert>
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
