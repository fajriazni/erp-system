import AppLayout from "@/layouts/app-layout"
import { Head, Link, router } from "@inertiajs/react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Eye } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SalesInvoicesIndex({ invoices }: { invoices: any }) {
    const columns = [
        {
            label: "Invoice #",
            key: "invoice_number",
            sortable: true,
            render: (row: any) => (
                <div className="font-medium">
                    <Link href={`/sales/invoices/${row.id}`} className="hover:underline text-primary">
                        {row.invoice_number}
                    </Link>
                </div>
            )
        },
        {
            label: "Customer",
            key: "customer.name",
            render: (row: any) => row.customer?.name || 'N/A'
        },
        {
            label: "Date",
            key: "date",
            sortable: true,
            render: (row: any) => format(new Date(row.date), "PP")
        },
        {
            label: "Total",
            key: "total_amount",
            sortable: true,
            render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.total_amount)
        },
        {
            label: "Status",
            key: "status",
            render: (row: any) => (
                <Badge variant={row.status === 'posted' ? 'secondary' : (row.status === 'paid' ? 'default' : 'outline')}>
                  {row.status}
                </Badge>
            )
        },
        {
            label: "Actions",
            key: "actions",
            className: "text-right",
            render: (row: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.visit(`/sales/invoices/${row.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Sales", href: "/sales" },
                { title: "Invoices", href: "/sales/invoices" },
            ]}
        >
            <Head title="Customer Invoices" />

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Customer Invoices</h2>
                    <p className="text-muted-foreground">
                        Manage your customer invoices and receivables.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/sales/invoices/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Invoice
                        </Link>
                    </Button>
                </div>
            </div>

            <DataTable
                data={invoices}
                columns={columns}
                searchPlaceholder="Search invoice # or customer..."
                baseUrl="/sales/invoices"
            />
        </AppLayout>
    )
}
