import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table'; // Make sure this exists and is reusable
import { index, create, show } from '@/routes/purchasing/rfqs';
import { Badge } from '@/components/ui/badge';

export default function Index({ rfqs }: { rfqs: any }) {
    const columns = [
        {
            label: 'Document #',
            key: 'document_number',
            sortable: true,
            className: 'font-medium',
            render: (row: any) => (
                <Link href={show.url(row.id)} className="underline hover:text-primary">
                    {row.document_number}
                </Link>
            )
        },
        {
            label: 'Title',
            key: 'title',
            sortable: true,
        },
        {
            label: 'Deadline',
            key: 'deadline',
            sortable: true,
            render: (row: any) => new Date(row.deadline).toLocaleDateString('id-ID'),
        },
        {
            label: 'Status',
            key: 'status',
            sortable: true,
            render: (row: any) => (
                <Badge variant={row.status === 'open' ? 'default' : row.status === 'closed' ? 'secondary' : 'outline'}>
                    {row.status.toUpperCase()}
                </Badge>
            ),
        },
        {
            label: 'Created At',
            key: 'created_at',
            sortable: true,
            render: (row: any) => new Date(row.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
        },
        {
            label: 'Created By',
            key: 'user.name',
            sortable: true,
            render: (row: any) => row.user?.name || '-',
        },
        {
            label: '',
            key: 'actions',
            className: 'text-right',
            render: (row: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={show.url(row.id)}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'RFQs', href: index.url() }
        ]}>
            <Head title="Request for Quotations" />
            
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Request for Quotations</h1>
                        <p className="text-muted-foreground">Manage tenders, invite vendors, and compare bids.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> Create RFQ
                        </Link>
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={rfqs}
                    searchPlaceholder="Search RFQ..."
                    routeParams={{}}
                    baseUrl={index.url()}
                    filters={[
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Draft', value: 'draft' },
                                { label: 'Open', value: 'open' },
                                { label: 'Closed', value: 'closed' },
                                { label: 'Awarded', value: 'awarded' },
                            ]
                        }
                    ]}
                />
            </div>
        </AppLayout>
    );
}
