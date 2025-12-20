import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Version {
    id: number;
    version_number: number;
    created_at: string;
    created_by?: { name: string };
    snapshot: any;
}

interface Props {
    version1: Version;
    version2: Version;
    comparison: {
        header_changes: Record<string, { old: any; new: any; changed: boolean }>;
        items_changes: {
            added: any[];
            removed: any[];
            modified: any[];
        };
        version1: { number: number; created_at: string; created_by: string };
        version2: { number: number; created_at: string; created_by: string };
    };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function VersionCompare({ version1, version2, comparison }: Props) {
    const orderId = version1.snapshot.header.id || version2.snapshot.header.id;
    const docNumber = version1.snapshot.header.document_number || version2.snapshot.header.document_number;

    const renderFieldComparison = (label: string, field: string) => {
        const change = comparison.header_changes[field];
        const val1 = version1.snapshot.header[field];
        const val2 = version2.snapshot.header[field];
        const isDifferent = change?.changed || val1 !== val2;

        const formatValue = (val: any) => {
            if (val === null || val === undefined) return '-';
            if (field.includes('total') || field.includes('amount')) return formatCurrency(Number(val));
            if (typeof val === 'boolean') return val ? 'Yes' : 'No';
            return val.toString();
        };

        return (
            <TableRow className={isDifferent ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                <TableCell className="font-medium">{label}</TableCell>
                <TableCell className={isDifferent ? 'font-semibold' : ''}>{formatValue(val1)}</TableCell>
                <TableCell className={isDifferent ? 'font-semibold' : ''}>{formatValue(val2)}</TableCell>
            </TableRow>
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Orders', href: '/purchasing/orders' },
            { title: docNumber, href: `/purchasing/orders/${orderId}` },
            { title: 'Version Compare' }
        ]}>
            <Head title={`Compare Versions - ${docNumber}`} />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Version Comparison"
                    description={`Comparing changes between versions`}
                >
                    <Button variant="outline" asChild>
                        <Link href={`/purchasing/orders/${orderId}/versions`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
                        </Link>
                    </Button>
                </PageHeader>

                {/* Version Headers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Version {version1.version_number}</CardTitle>
                                <Badge variant="secondary">Current</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div>{new Date(version1.created_at).toLocaleString('id-ID')}</div>
                                {version1.created_by && <div>by {version1.created_by.name}</div>}
                            </div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Version {version2.version_number}</CardTitle>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div>{new Date(version2.created_at).toLocaleString('id-ID')}</div>
                                {version2.created_by && <div>by {version2.created_by.name}</div>}
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Header Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Header Changes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/3">Field</TableHead>
                                    <TableHead className="w-1/3">Version {version1.version_number}</TableHead>
                                    <TableHead className="w-1/3">Version {version2.version_number}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderFieldComparison('Vendor', 'vendor_name')}
                                {renderFieldComparison('Warehouse', 'warehouse_name')}
                                {renderFieldComparison('Status', 'status')}
                                {renderFieldComparison('Date', 'date')}
                                {renderFieldComparison('Subtotal', 'subtotal')}
                                {renderFieldComparison('Tax Amount', 'tax_amount')}
                                {renderFieldComparison('Total', 'total')}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Items Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Items Changes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {comparison.items_changes.added.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2 text-green-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    Added Items ({comparison.items_changes.added.length})
                                </h4>
                                <div className="bg-green-50 dark:bg-green-950/20 rounded p-3 space-y-1">
                                    {comparison.items_changes.added.map((item: any, idx: number) => (
                                        <div key={idx} className="text-sm">
                                            • {item.product_name} - Qty: {item.quantity} @ {formatCurrency(item.unit_price)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {comparison.items_changes.removed.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    Removed Items ({comparison.items_changes.removed.length})
                                </h4>
                                <div className="bg-red-50 dark:bg-red-950/20 rounded p-3 space-y-1">
                                    {comparison.items_changes.removed.map((item: any, idx: number) => (
                                        <div key={idx} className="text-sm">
                                            • {item.product_name} - Qty: {item.quantity} @ {formatCurrency(item.unit_price)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {comparison.items_changes.modified.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    Modified Items ({comparison.items_changes.modified.length})
                                </h4>
                                <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-3 space-y-2">
                                    {comparison.items_changes.modified.map((item: any, idx: number) => (
                                        <div key={idx} className="text-sm space-y-1">
                                            <div className="font-medium">{item.product_name}</div>
                                            {Object.entries(item.changes).map(([field, change]: [string, any]) => (
                                                <div key={field} className="ml-4 text-muted-foreground">
                                                    {field}: {change.old} → {change.new}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {comparison.items_changes.added.length === 0 &&
                            comparison.items_changes.removed.length === 0 &&
                            comparison.items_changes.modified.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    No item changes between these versions
                                </div>
                            )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
