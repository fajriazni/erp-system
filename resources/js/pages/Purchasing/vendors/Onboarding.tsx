import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Clock, FileCheck, XCircle, CheckCircle2 } from 'lucide-react';

interface VendorOnboarding {
    id: number;
    vendor: {
        id: number;
        name: string;
        email: string;
    };
    status: string;
    checklist: Record<string, { label: string; completed: boolean }>;
    reviewed_by: number | null;
    reviewer?: {
        name: string;
    };
    reviewed_at: string | null;
    created_at: string;
}

interface Props {
    onboarding: {
        data: VendorOnboarding[];
        links: any[];
    };
    stats: {
        pending: number;
        in_review: number;
        approved: number;
        rejected: number;
    };
}

export default function Onboarding({ onboarding, stats }: Props) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: any; icon: any; className?: string }> = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            in_review: { label: 'In Review', variant: 'default' as const, icon: FileCheck },
            approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-600' },
            rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
        };

        const config = statusMap[status] || statusMap.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getChecklistCompletion = (checklist: Record<string, { completed: boolean }> | null) => {
        if (!checklist) return { completed: 0, total: 0, percentage: 0 };
        
        const items = Object.values(checklist);
        const completed = items.filter(item => item.completed).length;
        const total = items.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendor Onboarding', href: '#' },
        ]}>
            <Head title="Vendor Onboarding" />

            <div className="container mx-auto p-6 space-y-6">
                <PageHeader 
                    title="Vendor Onboarding"
                    description="Manage vendor registration and qualification workflow"
                >
                    <Button asChild>
                        <Link href="/purchasing/vendors/create">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Start New Onboarding
                        </Link>
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileCheck className="h-4 w-4" />
                                In Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.in_review}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Onboarding Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {onboarding.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                                <p>No onboarding records yet.</p>
                                <p className="text-sm mt-2">Start by creating a new vendor.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Checklist Progress</TableHead>
                                        <TableHead>Reviewer</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {onboarding.data.map((record) => {
                                        const progress = getChecklistCompletion(record.checklist);
                                        return (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <div className="font-medium">{record.vendor.name}</div>
                                                    <div className="text-xs text-muted-foreground">{record.vendor.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(record.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-sm font-medium">
                                                            {progress.completed}/{progress.total}
                                                        </span>
                                                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-primary transition-all" 
                                                                style={{ width: `${progress.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {progress.percentage}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {record.reviewer ? (
                                                        <div className="text-sm">{record.reviewer.name}</div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Unassigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {new Date(record.created_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/purchasing/vendors/${record.vendor.id}`}>
                                                            Review
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
