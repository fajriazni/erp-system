import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { index, create, show } from '@/routes/purchasing/returns';

export default function Index({ returns }: { returns: any }) {
    const columns = [
        {
            label: 'Document #',
            key: 'document_number',
            sortable: true,
            className: 'font-medium',
            render: (row: any) => (
                <Button variant="link" asChild className="p-0 h-auto font-medium text-primary">
                    <Link href={show.url(row.id)}>
                        {row.document_number}
                    </Link>
                </Button>
            ),
        },
        {
            label: 'Date',
            key: 'date',
            sortable: true,
            render: (row: any) => new Date(row.date).toLocaleDateString(),
        },
        {
            label: 'Vendor',
            key: 'vendor.name',
            sortable: true,
            render: (row: any) => row.vendor?.name || '-',
        },
        {
            label: 'Status',
            key: 'status',
            sortable: true,
            render: (row: any) => (
                <Badge variant={row.status === 'posted' ? 'default' : 'secondary'} className="capitalize">
                    {row.status}
                </Badge>
            ),
        },
        {
            label: 'Amount',
            key: 'amount',
            sortable: true,
            className: 'text-right',
            render: (row: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.amount),
        },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Returns', href: index.url() }
        ]}>
            <Head title="Purchase Returns" />
            
            {/* Standard aligned container */}
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Purchase Returns</h1>
                        <p className="text-muted-foreground">Manage returns to vendors (Debit Notes).</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> Create Return
                        </Link>
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={returns}
                    searchPlaceholder="Search returns..."
                    routeParams={{}}
                    baseUrl={index.url()}
                />
            </div>
        </AppLayout>
    );
}
