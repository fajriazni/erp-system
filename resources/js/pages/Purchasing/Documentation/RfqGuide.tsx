import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    Users, Send, Scale, FileCheck, CheckCircle2
} from 'lucide-react';

export default function RfqGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '/purchasing/documentation' },
            { title: 'RFQ & Tendering', href: '#' }
        ]}>
            <Head title="RFQ Guide" />

            <div className="container mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">RFQ & Tendering Guide</h1>
                    <p className="text-muted-foreground text-lg">
                       Managing the competitive bidding process.
                    </p>
                </div>

                <Tabs defaultValue="create" className="w-full">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Contents</h2>
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                    <TabsTrigger value="create" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Creating & Inviting
                                    </TabsTrigger>
                                    <TabsTrigger value="bids" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Collecting Bids
                                    </TabsTrigger>
                                    <TabsTrigger value="compare" className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted">
                                        Comparing & Awarding
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                            {/* Create */}
                            <TabsContent value="create" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Creating & Inviting</CardTitle>
                                        <CardDescription>Setting up the tender.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Workflow</h3>
                                            <ul className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                                <li><strong>Define Requirements:</strong> Add items and quantities. Set a deadline.</li>
                                                <li><strong>Select Vendors:</strong> Choose vendors from the registry. You can invite multiple vendors at once.</li>
                                                <li><strong>Send Invitation:</strong> Click "Send Invite" to email all selected vendors a secure link to the Vendor Portal.</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Bids */}
                            <TabsContent value="bids" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Collecting Bids</CardTitle>
                                        <CardDescription>Two ways to receive quotations.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Vendor Portal</h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Vendors click the email link, enter their prices and delivery dates directly into the system. Instant updates.
                                                </p>
                                            </div>
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-medium">Manual Entry</h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    If a vendor sends a PDF/Email, the Purchasing Officer can manually enter the bid details into the RFQ "Manage Quotes" section.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Compare */}
                            <TabsContent value="compare" className="space-y-6 mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Comparing & Awarding</CardTitle>
                                        <CardDescription>Selecting the winner.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="bg-muted p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2">Comparison Table</h3>
                                            <p className="text-sm text-muted-foreground">
                                                The system displays all bids side-by-side. 
                                                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Best Price</Badge> is highlighted automatically.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600"/> Awarding</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Click "Award" on the chosen vendor. This actions:
                                                <br/>1. Closes the RFQ.
                                                <br/>2. Creates a Draft Purchase Order for the winner.
                                                <br/>3. Sends regret emails to losing vendors (optional).
                                            </p>
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
