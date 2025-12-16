import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { index, create, show } from '@/routes/purchasing/receipts';

export default function GoodsReceiptIndex({ receipts }: { receipts: any }) {
    const columns = [
        {
            label: "Receipt #",
            key: "receipt_number",
            sortable: true,
            className: "font-medium",
            render: (gr: any) => (
                <Link href={show.url(gr.id)} className="hover:underline">
                    {gr.receipt_number}
                </Link>
            )
        },
        {
            label: "Date",
            key: "date",
            sortable: true,
            render: (gr: any) => new Date(gr.date).toLocaleDateString()
        },
        {
            label: "PO #",
            key: "purchase_order.document_number",
            render: (gr: any) => gr.purchase_order?.document_number || '-'
        },
        {
            label: "Warehouse",
            key: "warehouse.name",
            render: (gr: any) => gr.warehouse?.name || '-'
        },
        {
            label: "Status",
            key: "status",
            sortable: true,
            render: (gr: any) => {
                const colors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    posted: "bg-green-100 text-green-800",
                    cancelled: "bg-red-100 text-red-800",
                };
                return <Badge variant="outline" className={`capitalize ${colors[gr.status] || ''}`}>{gr.status}</Badge>;
            }
        },
        {
            label: "Received By",
            key: "received_by.name",
            render: (gr: any) => gr.received_by?.name || '-'
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'Goods Receipts', href: '/purchasing/receipts' }]}>
            <Head title="Goods Receipts" />
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Goods Receipts</h1>
                    <p className="text-muted-foreground">
                        Manage items received from vendors.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Receive Goods
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={receipts}
                searchPlaceholder="Search Receipts..."
                routeParams={{}}
                baseUrl={index.url()}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { label: "Draft", value: "draft" },
                            { label: "Posted", value: "posted" },
                            { label: "Cancelled", value: "cancelled" },
                        ]
                    }
                ]}
            />
        </AppLayout>
    );
}
