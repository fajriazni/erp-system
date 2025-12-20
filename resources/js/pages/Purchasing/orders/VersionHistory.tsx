import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, GitBranch, RotateCcw, Eye } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Version {
    id: number;
    version_number: number;
    change_type: string;
    change_summary: string;
    created_at: string;
    created_by?: {
        name: string;
    };
}

interface Props {
    order: {
        id: number;
        document_number: string;
        vendor: { name: string };
        status: string;
    };
    versions: Version[];
}

export default function VersionHistory({ order, versions }: Props) {
    const getChangeTypeColor = (changeType: string) => {
        switch (changeType) {
            case 'created':
                return 'bg-green-600';
            case 'status_changed':
                return 'bg-blue-600';
            case 'restored':
                return 'bg-purple-600';
            default:
                return 'bg-gray-600';
        }
    };

    const handleRestore = (versionId: number) => {
        router.post(`/purchasing/orders/versions/${versionId}/restore`);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Orders', href: '/purchasing/orders' },
            { title: order.document_number, href: `/purchasing/orders/${order.id}` },
            { title: 'Version History' }
        ]}>
            <Head title={`Version History - ${order.document_number}`} />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title={`Version History - ${order.document_number}`}
                    description={`Tracking all changes made to this purchase order`}
                >
                    <Button variant="outline" asChild>
                        <Link href={`/purchasing/orders/${order.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to PO
                        </Link>
                    </Button>
                </PageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Timeline ({versions.length} versions)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative space-y-8">
                            {/* Timeline line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                            {versions.map((version, index) => (
                                <div key={version.id} className="relative pl-20">
                                    {/* Timeline dot */}
                                    <div className={`absolute left-6 w-5 h-5 rounded-full ${getChangeTypeColor(version.change_type)} ring-4 ring-background`} />

                                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono">
                                                        v{version.version_number}
                                                    </Badge>
                                                    <Badge className={getChangeTypeColor(version.change_type)}>
                                                        {version.change_type.replace('_', ' ')}
                                                    </Badge>
                                                    {index === 0 && (
                                                        <Badge variant="secondary">Current</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {version.change_summary || 'Initial version'}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                {index > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <Link href={`/purchasing/orders/versions/${versions[0].id}/compare/${version.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> Compare
                                                        </Link>
                                                    </Button>
                                                )}

                                                {index !== 0 && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="outline">
                                                                <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Restore Version {version.version_number}?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will revert the purchase order to version {version.version_number}.
                                                                    A new version will be created to record this restoration.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleRestore(version.id)}>
                                                                    Confirm Restore
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {new Date(version.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </div>
                                            {version.created_by && (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {version.created_by.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
