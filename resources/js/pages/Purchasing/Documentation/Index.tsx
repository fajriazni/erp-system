import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Award, BookOpen, Calculator, FileCheck, FileSignature, 
    BarChart, ShoppingCart, PackageCheck, Users, ArrowRight, Zap
} from 'lucide-react';

export default function DocumentationIndex() {
    const documentationItems = [
        {
            id: 'srm',
            title: 'Sourcing & SRM Guide',
            description: 'Complete guide for Supplier Relationship Management including Registry, Scorecards, Onboarding, and Audits',
            icon: Award,
            url: '/purchasing/documentation/srm-guide',
            badge: 'Available',
            badgeVariant: 'default' as const,
            topics: ['Supplier Registry', 'Performance Scorecards', 'Vendor Onboarding', 'Qualification & Audits']
        },
        {
            id: 'contracts',
            title: 'Contracts & Agreements',
            description: 'Managing purchase agreements, blanket orders, and contract renewals',
            icon: FileSignature,
            url: '/purchasing/documentation/contracts-guide',
            badge: 'Coming Soon',
            badgeVariant: 'secondary' as const,
            topics: ['Purchase Agreements', 'Blanket Orders', 'Renewal Alerts', 'Contract Templates']
        },
        {
            id: 'operations',
            title: 'Purchasing Operations',
            description: 'Day-to-day purchasing workflows including requisitions and purchase orders',
            icon: ShoppingCart,
            url: '/purchasing/documentation/operations-guide',
            badge: 'Coming Soon',
            badgeVariant: 'secondary' as const,
            topics: ['Purchase Requisitions', 'Purchase Orders', 'Direct Purchasing', 'PO Revisions']
        },
        {
            id: 'receiving',
            title: 'Receiving & Quality Control',
            description: 'Goods receipt processes, quality inspection, and landed cost allocation',
            icon: PackageCheck,
            url: '/purchasing/documentation/receiving-guide',
            badge: 'Coming Soon',
            badgeVariant: 'secondary' as const,
            topics: ['Goods Receipt (GR)', 'Three-Way Matching', 'Quality Inspection', 'Landed Costs']
        },
        {
            id: 'analytics',
            title: 'Analytics & Reporting',
            description: 'Performance monitoring, spend analysis, and strategic reporting',
            icon: BarChart,
            url: '/purchasing/documentation/analytics-guide',
            badge: 'Coming Soon',
            badgeVariant: 'secondary' as const,
            topics: ['Spend Analysis', 'Price Variance', 'PO Aging Reports', 'History Analytics']
        },
        {
            id: 'rfq',
            title: 'RFQ & Tendering',
            description: 'Request for Quotation process and vendor quotation comparison',
            icon: Users,
            url: '/purchasing/documentation/rfq-guide',
            badge: 'Coming Soon',
            badgeVariant: 'secondary' as const,
            topics: ['Creating RFQs', 'Inviting Vendors', 'Quotation Comparison', 'Awarding Contracts']
        },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Documentation', href: '#' }
        ]}>
            <Head title="Purchasing Documentation Center" />

            <div className="container mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Purchasing Documentation</h1>
                            <p className="text-muted-foreground text-lg">
                                Comprehensive guides and resources for all Purchasing module features
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded">
                                    <FileCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">
                                        {documentationItems.filter(d => d.badge === 'Available').length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Available Guides</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">
                                        {documentationItems.filter(d => d.badge === 'Coming Soon').length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded">
                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{documentationItems.length}</div>
                                    <p className="text-sm text-muted-foreground">Total Topics</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Documentation Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documentationItems.map((doc) => {
                        const Icon = doc.icon;
                        const isAvailable = doc.badge === 'Available';
                        
                        return (
                            <Card 
                                key={doc.id} 
                                className={`group transition-all hover:shadow-lg ${isAvailable ? 'hover:border-primary' : 'opacity-75'}`}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <Badge variant={doc.badgeVariant}>{doc.badge}</Badge>
                                    </div>
                                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                                    <CardDescription className="text-sm min-h-[3rem]">
                                        {doc.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                                            Covered Topics
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {doc.topics.map((topic, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {isAvailable ? (
                                        <Button asChild className="w-full group">
                                            <Link href={doc.url}>
                                                Read Guide
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button disabled className="w-full">
                                            Coming Soon
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Help Section */}
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5" />
                            Need More Help?
                        </CardTitle>
                        <CardDescription>
                            Can't find what you're looking for? Here are additional resources:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                            <p className="text-muted-foreground">
                                Contact your <strong>Purchasing Manager</strong> for process-specific questions
                            </p>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                            <p className="text-muted-foreground">
                                Reach out to <strong>IT Support</strong> for technical assistance or system issues
                            </p>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                            <p className="text-muted-foreground">
                                Check the <strong>System Changelog</strong> for latest updates and new features
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
