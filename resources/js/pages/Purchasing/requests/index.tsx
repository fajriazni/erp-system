import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
// import { index, create, show } from '@/routes/purchasing/requests'; // Wayfinder routes not generated yet? 
// Manual routes for now until Wayfinder regenerates
const indexUrl = '/purchasing/requests';
const createUrl = '/purchasing/requests/create';
const showUrl = (id: number) => `/purchasing/requests/${id}`;

export default function PurchaseRequestIndex({ requests }: { requests: any }) {
    const columns = [
        {
            label: "Document #",
            key: "document_number",
            sortable: true,
            className: "font-medium",
             render: (pr: any) => (
                <Link href={showUrl(pr.id)} className="hover:underline">
                    {pr.document_number}
                </Link>
            )
        },
        {
            label: "Date",
            key: "date",
            sortable: true,
            render: (pr: any) => new Date(pr.date).toLocaleDateString()
        },
        {
            label: "Requester",
            key: "requester.name",
             render: (pr: any) => pr.requester?.name || '-'
        },
        {
            label: "Status",
            key: "status",
            sortable: true,
            render: (pr: any) => {
                 let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                 if (pr.status === 'approved') variant = "default";
                 if (pr.status === 'rejected') variant = "destructive";
                 if (pr.status === 'submitted') variant = "secondary";
                 
                 return <Badge variant={variant} className="capitalize">{pr.status}</Badge>
            }
        },
        {
            label: "Created At",
            key: "created_at",
            sortable: true,
            className: "text-right",
            render: (pr: any) => new Date(pr.created_at).toLocaleDateString()
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'Purchase Requests', href: '/purchasing/requests' }]}>
            <Head title="Purchase Requests" />
             <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Purchase Requests</h1>
                    <p className="text-muted-foreground">
                        Manage internal purchase requests.
                    </p>
                </div>
                <Button asChild>
                    <Link href={createUrl}>
                        <Plus className="mr-2 h-4 w-4" /> Create Request
                    </Link>
                </Button>
            </div>

             <DataTable
                columns={columns}
                data={requests}
                searchPlaceholder="Search Requests..."
                routeParams={{}}
                baseUrl={indexUrl}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                             { label: "Draft", value: "draft" },
                             { label: "Submitted", value: "submitted" },
                             { label: "Approved", value: "approved" },
                             { label: "Rejected", value: "rejected" },
                        ]
                    }
                ]}
            />
        </AppLayout>
    );
}
