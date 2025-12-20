import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Clock, User, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Version {
    id: number;
    purchase_order_id: number;
    version_number: number;
    change_type: string;
    change_summary: string;
    created_at: string;
    created_by?: { name: string };
    purchase_order: {
        document_number: string;
    };
}

interface Props {
    recentVersions: Version[];
}

export default function VersionControl({ recentVersions }: Props) {
    const getChangeTypeColor = (type: string) => {
        switch (type) {
            case 'created': return 'bg-green-600';
            case 'status_changed': return 'bg-blue-600';
            case 'restored': return 'bg-purple-600';
            default: return 'bg-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Operations', href: '/purchasing' },
            { title: 'Version Control' }
        ]}>
            <Head title="PO Version Control" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Version Control Dashboard"
                    description="Monitor recent changes and audit trails across all purchase orders."
                >
                    <Button variant="outline" asChild>
                        <Link href="/purchasing/orders">
                            Back to Orders <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </PageHeader>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Versions</CardTitle>
                            <div className="text-2xl font-bold">{recentVersions.length}</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">Recent activities</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Contributors</CardTitle>
                            <div className="text-2xl font-bold">
                                {new Set(recentVersions.map(v => v.created_by?.name)).size}
                            </div>
                        </CardHeader>
                         <CardContent>
                            <div className="text-xs text-muted-foreground">Users making changes</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Change Frequency</CardTitle>
                            <div className="text-2xl font-bold">
                                {recentVersions.filter(v => 
                                    new Date(v.created_at).getDate() === new Date().getDate()
                                ).length}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">Changes today</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest 50 versions created across the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Summary</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentVersions.length > 0 ? (
                                    recentVersions.map((version) => (
                                        <TableRow key={version.id}>
                                            <TableCell className="whitespace-nowrap flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                {new Date(version.created_at).toLocaleString('id-ID', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Link 
                                                    href={`/purchasing/orders/${version.purchase_order_id}`}
                                                    className="hover:underline text-primary"
                                                >
                                                    {version.purchase_order.document_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">v{version.version_number}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getChangeTypeColor(version.change_type)}>
                                                    {version.change_type.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-md truncate" title={version.change_summary}>
                                                {version.change_summary || <span className="text-muted-foreground italic">No summary</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    {version.created_by?.name || 'System'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/purchasing/orders/${version.purchase_order_id}/versions`}>
                                                        View History
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No recent version activity found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
