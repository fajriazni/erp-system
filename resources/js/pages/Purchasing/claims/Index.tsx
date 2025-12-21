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
import { Plus, Search, ChevronRight, AlertCircle } from 'lucide-react';

interface VendorClaim {
    id: number;
    claim_number: string;
    vendor: { name: string };
    claim_date: string;
    claim_type: string;
    status: string;
    claim_amount: number;
    settlement_amount?: number;
}

interface Props {
    claims: {
        data: VendorClaim[];
    };
}

const statusColors: Record<string, string> = {
    submitted: 'bg-blue-500',
    under_review: 'bg-yellow-500',
    disputed: 'bg-orange-500',
    approved: 'bg-green-500',
    settled: 'bg-green-700',
    rejected: 'bg-red-500',
};

export default function Index({ claims }: Props) {
    const [search, setSearch] = useState('');

    const filteredClaims = (claims?.data || []).filter((claim) =>
        claim.claim_number.toLowerCase().includes(search.toLowerCase()) ||
        claim.vendor.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendor Claims', href: '/purchasing/claims' }
        ]}>
            <Head title="Vendor Claims" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Vendor Claims"
                    description="Manage compensation claims and disputes with vendors"
                >
                    <Button asChild>
                        <Link href="/purchasing/claims/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Claim
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="p-0 gap-0">
                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search claims..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Claim Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClaims.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No claims found. File a claim when there are issues with vendor deliveries.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClaims.map((claim) => (
                                    <TableRow
                                        key={claim.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/purchasing/claims/${claim.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                                <span>{claim.claim_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(claim.claim_date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>{claim.vendor.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {claim.claim_type.replace(/_/g, ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[claim.status]}>
                                                {claim.status.replace(/_/g, ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${Number(claim.claim_amount).toLocaleString()}
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
