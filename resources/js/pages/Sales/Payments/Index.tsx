import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { format } from "date-fns"

export default function SalesPaymentsIndex({ payments }: { payments: any }) {
    const columns = [
        {
            label: "Payment #",
            key: "payment_number",
            sortable: true,
             render: (row: any) => (
                <div className="font-medium">
                    {row.payment_number}
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
            label: "Amount",
            key: "amount",
            sortable: true,
             render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.amount)
        },
        {
            label: "Method",
            key: "payment_method",
        }
    ]

    return (
        <AppLayout breadcrumbs={[{ title: "Sales", href: "/sales" }, { title: "Payments", href: "/sales/payments" }]}>
            <Head title="Customer Payments" />

            <div className="flex items-center justify-between space-y-2">
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payments Received</h2>
                    <p className="text-muted-foreground">
                        Track payments from customers.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/sales/payments/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Receive Payment
                        </Link>
                    </Button>
                </div>
            </div>

            <DataTable
                data={payments}
                columns={columns}
                searchPlaceholder="Search payment #..."
                baseUrl="/sales/payments"
            />
        </AppLayout>
    )
}
