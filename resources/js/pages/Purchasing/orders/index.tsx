import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { index, create, show } from '@/routes/purchasing/orders';

export default function PurchaseOrderIndex({ orders }: { orders: any }) {
    const columns = [
        {
            label: "Document #",
            key: "document_number",
            sortable: true,
            className: "font-medium",
             render: (po: any) => (
                <Link href={show.url(po.id)} className="hover:underline">
                    {po.document_number}
                </Link>
            )
        },
        {
            label: "Date",
            key: "date",
            sortable: true,
            render: (po: any) => new Date(po.date).toLocaleDateString()
        },
        {
            label: "Vendor",
            key: "vendor.name",
             render: (po: any) => po.vendor?.name || '-'
        },
        {
            label: "Warehouse",
            key: "warehouse.name",
             render: (po: any) => po.warehouse?.name || '-'
        },
        {
            label: "Status",
            key: "status",
            sortable: true,
            render: (po: any) => <Badge variant="outline" className="capitalize">{po.status.replace('_', ' ')}</Badge>
        },
        {
            label: "Total",
            key: "total",
            sortable: true,
             className: "text-right",
            render: (po: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(po.total)
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'Purchase Orders', href: '/purchasing/orders' }]}>
            <Head title="Purchase Orders" />
             <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">
                        Manage your purchase orders and RFQs.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Create PO
                    </Link>
                </Button>
            </div>

             <DataTable
                columns={columns}
                data={orders}
                searchPlaceholder="Search POs..."
                routeParams={{}}
                baseUrl={index.url()}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                             { label: "Draft", value: "draft" },
                             { label: "RFQ Sent", value: "rfq_sent" },
                             { label: "To Approve", value: "to_approve" },
                             { label: "Purchase Order", value: "purchase_order" },
                             { label: "Cancelled", value: "cancelled" },
                        ]
                    }
                ]}
            />
        </AppLayout>
    );
}
