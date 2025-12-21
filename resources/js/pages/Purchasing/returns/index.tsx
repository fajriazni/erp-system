import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Search, ChevronRight, Package } from 'lucide-react';

interface PurchaseReturn {
    id: number;
    return_number: string;
    vendor: { name: string };
    warehouse: { name: string };
    return_date: string;
    status: string;
    total_amount: number;
}

interface Props {
    returns: {
        data: PurchaseReturn[];
    };
}

const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    pending_authorization: 'bg-yellow-500',
    ready_to_ship: 'bg-blue-500',
    shipped: 'bg-purple-500',
    received_by_vendor: 'bg-green-500',
    completed: 'bg-green-700',
    cancelled: 'bg-red-500',
};

export default function Index({ returns }: Props) {
    const [search, setSearch] = useState('');

    const filteredReturns = (returns?.data || []).filter((ret) =>
        ret.return_number.toLowerCase().includes(search.toLowerCase()) ||
        ret.vendor.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Returns', href: '/purchasing/returns' }
        ]}>
            <Head title="Purchase Returns (RMA)" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Purchase Returns (RMA)"
                    description="Manage returns of defective or incorrect goods to vendors"
                >
                    <Button asChild>
                        <Link href="/purchasing/returns/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Return
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="p-0 gap-0">
                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search returns..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Return Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReturns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No returns found. Create a return from a goods receipt or QC inspection.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReturns.map((ret) => (
                                    <TableRow
                                        key={ret.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/purchasing/returns/${ret.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span>{ret.return_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(ret.return_date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>{ret.vendor.name}</TableCell>
                                        <TableCell>{ret.warehouse.name}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[ret.status]}>
                                                {ret.status.replace(/_/g, ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${Number(ret.total_amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
