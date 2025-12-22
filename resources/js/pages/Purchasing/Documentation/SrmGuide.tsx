import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    Award, Building2, CheckCircle2, FileCheck, Info, 
    TrendingUp, Users, UserPlus, Zap, ArrowRight,
} from 'lucide-react';

export default function UserGuide() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '/purchasing/documentation' },
            { title: 'SRM User Guide', href: '#' }
        ]}>
            <Head title="SRM User Guide - Sourcing & Supplier Relationship Management" />

            <div className="container mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Sourcing & SRM User Guide</h1>
                    <p className="text-muted-foreground text-lg">
                        Comprehensive guide for Supplier Relationship Management features
                    </p>
                </div>

                {/* Overview Alert */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>About This Guide</AlertTitle>
                    <AlertDescription>
                        This guide covers all features in the Sourcing & SRM module, including Supplier Registry, 
                        Performance Scorecards, Vendor Onboarding, and Qualification Audits.
                    </AlertDescription>
                </Alert>

                <Tabs defaultValue="overview" className="w-full">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    Contents
                                </h2>
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                                    <TabsTrigger 
                                        value="overview" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="registry" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Supplier Registry
                                    </TabsTrigger>

                                    <TabsTrigger 
                                        value="scorecards" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Scorecards
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="onboarding" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Onboarding
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="audits" 
                                        className="w-full justify-start px-4 py-2 text-left font-medium hover:bg-muted/50 data-[state=active]:bg-muted"
                                    >
                                        Audits
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="min-h-screen">

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>SRM Module Overview</CardTitle>
                                <CardDescription>Understanding the Supplier Relationship Management ecosystem</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        What is SRM?
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Supplier Relationship Management (SRM) is a strategic approach to managing vendor relationships
                                        through systematic evaluation, performance tracking, and continuous improvement initiatives.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            title: "Supplier Registry",
                                            icon: Users,
                                            description: "Centralized database of all vendors with contact information and performance metrics",
                                            badge: "Core"
                                        },
                                        {
                                            title: "Performance Scorecards",
                                            icon: Award,
                                            description: "Automated tracking and ranking of vendor performance based on delivery, quality, and returns",
                                            badge: "Automated"
                                        },
                                        {
                                            title: "Vendor Onboarding",
                                            icon: UserPlus,
                                            description: "Structured workflow to qualify and activate new suppliers",
                                            badge: "Workflow"
                                        },
                                        {
                                            title: "Qualification & Audits",
                                            icon: FileCheck,
                                            description: "Scheduled audits to ensure vendor compliance and capability",
                                            badge: "Quality"
                                        },

                                    ].map((feature, idx) => (
                                        <Card key={idx} className="border-l-4 border-l-primary">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <feature.icon className="h-5 w-5 text-primary" />
                                                        <CardTitle className="text-base">{feature.title}</CardTitle>
                                                    </div>
                                                    <Badge variant="secondary">{feature.badge}</Badge>
                                                </div>
                                                <CardDescription className="text-sm">
                                                    {feature.description}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>

                                <div className="bg-muted p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Integration Flow
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm flex-wrap">
                                        <Badge variant="outline">New Vendor</Badge>
                                        <ArrowRight className="h-3 w-3" />
                                        <Badge variant="outline">Onboarding</Badge>
                                        <ArrowRight className="h-3 w-3" />
                                        <Badge variant="outline">Registry</Badge>
                                        <ArrowRight className="h-3 w-3" />
                                        <Badge variant="outline">PO & Receipt</Badge>
                                        <ArrowRight className="h-3 w-3" />
                                        <Badge variant="outline">Auto-Score</Badge>
                                        <ArrowRight className="h-3 w-3" />
                                        <Badge variant="outline">Audit</Badge>
                                        <ArrowRight className="h-3 w-3" />
                                        <Badge variant="outline">Review</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Supplier Registry Tab */}
                    <TabsContent value="registry" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier Registry</CardTitle>
                                <CardDescription>Master database for all vendor information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Purpose</h3>
                                    <p className="text-sm text-muted-foreground">
                                        The Supplier Registry serves as the single source of truth for all vendor information, 
                                        including contact details, performance metrics, and relationship status.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">How to Use</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                        <li>Navigate to <code className="bg-muted px-2 py-0.5 rounded">/purchasing/vendors</code></li>
                                        <li>View all active vendors with their performance ratings</li>
                                        <li>Use the search bar to filter by name, email, or phone</li>
                                        <li>Click "View" to see complete vendor profile</li>
                                        <li>Check rating stars (0-5) for quick performance assessment</li>
                                        <li>Green badge (≥90%) indicates excellent on-time delivery</li>
                                    </ol>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Data Displayed</h3>
                                    <div className="grid gap-2">
                                        {[
                                            "Vendor Name with Building icon",
                                            "Contact information (Email & Phone)",
                                            "Vendor Type (Vendor / Customer / Both)",
                                            "Performance Rating (0-5 stars)",
                                            "On-Time Delivery percentage",
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-muted-foreground">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>



                    {/* Scorecards Tab */}
                    <TabsContent value="scorecards" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Scorecards <Badge className="ml-2">Automated</Badge></CardTitle>
                                <CardDescription>Automated vendor performance tracking and ranking</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertTitle className="text-blue-900">Fully Automated</AlertTitle>
                                    <AlertDescription className="text-blue-800">
                                        Performance metrics are automatically recorded from your transactions. 
                                        No manual data entry required!
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">How Performance Is Recorded</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-l-green-500 pl-4 py-2">
                                            <h4 className="font-medium text-sm mb-2">1. Delivery Performance (35% weight)</h4>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Automatically recorded when Goods Receipt (GR) is created:
                                            </p>
                                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                                <li>Score starts at 100 if delivered on time</li>
                                                <li>Reduced by 5% per day late</li>
                                                <li>Compares Expected Date vs Actual Receipt Date</li>
                                            </ul>
                                        </div>

                                        <div className="border-l-4 border-l-blue-500 pl-4 py-2">
                                            <h4 className="font-medium text-sm mb-2">2. Quality Performance (45% weight)</h4>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Recorded during Quality Control (QC) inspection:
                                            </p>
                                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                                <li>Score = (Passed Qty ÷ Total Qty) × 100%</li>
                                                <li>Example: 95 passed, 5 failed = 95% quality score</li>
                                                <li>Highest weight because quality is critical</li>
                                            </ul>
                                        </div>

                                        <div className="border-l-4 border-l-orange-500 pl-4 py-2">
                                            <h4 className="font-medium text-sm mb-2">3. Return Performance (20% weight)</h4>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Tracked when Purchase Returns are processed:
                                            </p>
                                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                                <li>Records quantity of returned items</li>
                                                <li>Lower return rate = better performance</li>
                                                <li>Calculated as % of total received goods</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Rating Calculation</h3>
                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                        <p className="text-sm font-mono">
                                            Final Rating = (On-Time × 0.35) + (Quality × 0.45) + (Return × 0.20)
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Result is converted to 0-5 star rating displayed in the interface
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Performance Badges</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge className="bg-green-600">Excellent</Badge>
                                        <span className="text-sm text-muted-foreground">≥ 4.5 stars</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge className="bg-blue-600">Good</Badge>
                                        <span className="text-sm text-muted-foreground">3.5 - 4.4 stars</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">Fair</Badge>
                                        <span className="text-sm text-muted-foreground">2.5 - 3.4 stars</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="destructive">Needs Improvement</Badge>
                                        <span className="text-sm text-muted-foreground">{'<'} 2.5 stars</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Onboarding Tab */}
                    <TabsContent value="onboarding" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vendor Onboarding Workflow</CardTitle>
                                <CardDescription>Structured process to qualify new suppliers</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4 border rounded-lg p-4">
                                    <h3 className="font-semibold">Onboarding Stages</h3>
                                    
                                    {[
                                        {
                                            stage: "Inquiry",
                                            description: "Initial contact from prospective vendor",
                                            tasks: ["Receive inquiry", "Initial screening", "Check basic requirements"]
                                        },
                                        {
                                            stage: "Documents",
                                            description: "Vendor submits required documentation",
                                            tasks: ["NPWP (Tax ID)", "SIUP (Business License)", "Company Profile", "Financial Statements", "Product Catalog"]
                                        },
                                        {
                                            stage: "Review",
                                            description: "Purchasing team reviews submitted documents",
                                            tasks: ["Verify document authenticity", "Assess capabilities", "Check references", "Site visit (if applicable)"]
                                        },
                                        {
                                            stage: "Approval",
                                            description: "Management approval required",
                                            tasks: ["Present vendor profile", "Risk assessment", "Pricing negotiation", "Contract terms"]
                                        },
                                        {
                                            stage: "Completed",
                                            description: "Vendor is active in the system",
                                            tasks: ["Create vendor record", "Set payment terms", "Assign category", "Begin transactions"]
                                        },
                                    ].map((item, idx) => (
                                        <div key={idx}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </div>
                                                <h4 className="font-semibold">{item.stage}</h4>
                                            </div>
                                            <p className="pl-10 text-sm text-muted-foreground">{item.description}</p>
                                            <div className="pl-14 space-y-1">
                                                {item.tasks.map((task, taskIdx) => (
                                                    <div key={taskIdx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                                        {task}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Best Practices</h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                                            <span>Set clear timelines for each stage to maintain momentum</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                                            <span>Assign a dedicated PIC (Person In Charge) for each vendor</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                                            <span>Track document completion % to identify bottlenecks</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                                            <span>Communicate regularly with vendors about their status</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audits Tab */}
                    <TabsContent value="audits" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Qualification & Audits</CardTitle>
                                <CardDescription>Scheduled assessments to ensure vendor quality and compliance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Audit Components</h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {[
                                            { name: "Financial Health", weight: "20%", desc: "Stability, credit terms, payment history" },
                                            { name: "Quality System", weight: "30%", desc: "ISO certification, QC processes, documentation" },
                                            { name: "Production Capacity", weight: "20%", desc: "Equipment, workforce, output capability" },
                                            { name: "Delivery Reliability", weight: "20%", desc: "On-time performance, logistics capability" },
                                            { name: "Documentation", weight: "10%", desc: "Licenses, certifications, compliance records" },
                                        ].map((component, idx) => (
                                            <div key={idx} className="border rounded-lg p-3 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-sm">{component.name}</h4>
                                                    <Badge variant="outline" className="text-xs">{component.weight}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{component.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Grading System</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-green-600 w-12">A</Badge>
                                            <span className="text-sm text-muted-foreground">90-100 points: Excellent, preferred supplier</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-blue-600 w-12">B</Badge>
                                            <span className="text-sm text-muted-foreground">80-89 points: Good, approved for regular orders</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-yellow-600 w-12">C</Badge>
                                            <span className="text-sm text-muted-foreground">70-79 points: Acceptable, requires monitoring</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="destructive" className="w-12">D</Badge>
                                            <span className="text-sm text-muted-foreground">Below 70: Needs improvement or phase out</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Audit Frequency</h3>
                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">New Vendors:</span>
                                            <span className="text-muted-foreground">Initial audit + 6-month follow-up</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Grade A Suppliers:</span>
                                            <span className="text-muted-foreground">Annual audit</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Grade B-C Suppliers:</span>
                                            <span className="text-muted-foreground">Semi-annual audit</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Grade D Suppliers:</span>
                                            <span className="text-muted-foreground">Quarterly review or termination</span>
                                        </div>
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
                        For questions or support with SRM features, contact your Purchasing Manager or 
                        IT Support team. This documentation will be updated as new features are added.
                    </AlertDescription>
                </Alert>
            </div>
        </AppLayout>
    );
}
