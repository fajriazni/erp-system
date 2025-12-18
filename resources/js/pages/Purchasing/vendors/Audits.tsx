import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, Calendar, Loader, CheckCircle2, Award } from 'lucide-react';

interface VendorAudit {
    id: number;
    vendor: {
        id: number;
        name: string;
    };
    audit_type: string;
    audit_date: string;
    auditor: {
        name: string;
    };
    score: number | null;
    status: string;
    next_audit_date: string | null;
}

interface Props {
    audits: {
        data: VendorAudit[];
        links: any[];
    };
    stats: {
        scheduled: number;
        in_progress: number;
        completed: number;
        avg_score: number;
    };
}

export default function Audits({ audits, stats }: Props) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: any; icon: any; className?: string }> = {
            scheduled: { label: 'Scheduled', variant: 'secondary' as const, icon: Calendar },
            in_progress: { label: 'In Progress', variant: 'default' as const, icon: Loader, className: 'bg-blue-600' },
            completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-600' },
        };

        const config = statusMap[status] || statusMap.scheduled;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getAuditTypeBadge = (type: string) => {
        const types: Record<string, string> = {
            initial: 'Initial',
            periodic: 'Periodic',
            quality: 'Quality',
            compliance: 'Compliance',
        };
        return types[type] || type;
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) return <span className="text-muted-foreground">Pending</span>;
        
        if (score >= 90) return <Badge className="bg-green-600">{score.toFixed(0)}%</Badge>;
        if (score >= 75) return <Badge className="bg-blue-600">{score.toFixed(0)}%</Badge>;
        if (score >= 60) return <Badge variant="secondary">{score.toFixed(0)}%</Badge>;
        return <Badge variant="destructive">{score.toFixed(0)}%</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendor Audits', href: '#' },
        ]}>
            <Head title="Vendor Qualification & Audits" />

            <div className="container mx-auto p-6 space-y-6">
                <PageHeader 
                    title="Vendor Qualification & Audits"
                    description="Track and manage supplier qualification assessments"
                >
                    <Button>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Schedule Audit
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.scheduled}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Loader className="h-4 w-4" />
                                In Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Avg Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_score.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Schedule & Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {audits.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileCheck className="h-12 w-12 mb-4 opacity-50" />
                                <p>No vendor audits scheduled yet.</p>
                                <p className="text-sm mt-2">Schedule audits to assess supplier qualifications.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Audit Date</TableHead>
                                        <TableHead>Auditor</TableHead>
                                        <TableHead className="text-center">Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Next Audit</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {audits.data.map((audit) => (
                                        <TableRow key={audit.id}>
                                            <TableCell className="font-medium">{audit.vendor.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getAuditTypeBadge(audit.audit_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(audit.audit_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-sm">{audit.auditor.name}</TableCell>
                                            <TableCell className="text-center">
                                                {getScoreBadge(audit.score)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(audit.status)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {audit.next_audit_date 
                                                    ? new Date(audit.next_audit_date).toLocaleDateString()
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/purchasing/vendors/${audit.vendor.id}`}>
                                                        Details
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
