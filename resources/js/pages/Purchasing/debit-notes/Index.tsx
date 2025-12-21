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
import { Plus, Search, ChevronRight, FileText } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

interface DebitNote {
    id: number;
    debit_note_number: string;
    vendor: { name: string };
    date: string;
    status: string;
    total_amount: number;
    remaining_amount: number;
    purchase_return?: { return_number: string };
}

interface Props {
    debitNotes: {
        data: DebitNote[];
    };
}

const statusColors: Record<string, string> = {
    unposted: 'bg-gray-500',
    posted: 'bg-blue-500',
    partially_applied: 'bg-yellow-500',
    applied: 'bg-green-700',
    voided: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
    unposted: 'Unposted',
    posted: 'Posted',
    partially_applied: 'Partially Applied',
    applied: 'Applied',
    voided: 'Voided',
};

export default function Index({ debitNotes }: Props) {
    const [search, setSearch] = useState('');

    const filteredNotes = (debitNotes?.data || []).filter((dn) =>
        dn.debit_note_number.toLowerCase().includes(search.toLowerCase()) ||
        dn.vendor.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Debit Notes' }
        ]}>
            <Head title="Debit Notes" />
            <div className="container mx-auto p-6 space-y-6">
                <PageHeader
                    title="Debit Notes"
                    description="Manage vendor debit notes and applications"
                    action={
                        <Link href="/purchasing/debit-notes/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Debit Note
                            </Button>
                        </Link>
                    }
                />

                <Card className="p-6">
                    <div className="mb-4 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by DN number or vendor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {filteredNotes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium">No debit notes found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {search ? 'Try adjusting your search' : 'Create your first debit note to get started'}
                            </p>
                            {!search && (
                                <Link href="/purchasing/debit-notes/create">
                                    <Button className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Debit Note
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>DN Number</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead className="text-right">Remaining</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredNotes.map((dn) => (
                                    <TableRow
                                        key={dn.id}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => router.visit(`/purchasing/debit-notes/${dn.id}`)}
                                    >
                                        <TableCell className="font-mono font-medium">
                                            {dn.debit_note_number}
                                        </TableCell>
                                        <TableCell>{dn.vendor.name}</TableCell>
                                        <TableCell>
                                            {new Date(dn.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {dn.purchase_return ? (
                                                <Badge variant="outline" className="text-xs">
                                                    {dn.purchase_return.return_number}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Manual</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {useCurrency().format(dn.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {useCurrency().format(dn.remaining_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[dn.status]}>
                                                {statusLabels[dn.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
