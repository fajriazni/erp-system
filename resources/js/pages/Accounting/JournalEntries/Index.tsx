import AppLayout from "@/layouts/app-layout"
import { Head, Link, router } from "@inertiajs/react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Eye, Edit } from "lucide-react"
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

export default function JournalEntriesIndex({ entries }: { entries: any }) {
    const columns = [
        {
            label: "Reference",
            key: "reference_number",
            sortable: true,
            render: (row: any) => (
                <div className="font-medium">
                    <Link href={`/accounting/journal-entries/${row.id}`} className="hover:underline text-primary">
                        {row.reference_number}
                    </Link>
                </div>
            )
        },
        {
            label: "Date",
            key: "date",
            sortable: true,
            render: (row: any) => format(new Date(row.date), "PP")
        },
         {
            label: "Description",
            key: "description",
            render: (row: any) => (
                <div className="max-w-[400px] truncate" title={row.description}>
                     {row.description}
                </div>
            )
        },
        {
            label: "Lines",
            key: "lines_count",
            className: "text-center"
        },
        {
            label: "Status",
            key: "status",
            render: (row: any) => (
                <Badge variant={row.status === 'posted' ? 'default' : 'secondary'}>
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
                        <DropdownMenuItem onClick={() => router.visit(`/accounting/journal-entries/${row.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        {row.status === 'draft' && (
                            <DropdownMenuItem onClick={() => router.visit(`/accounting/journal-entries/${row.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Journal Entries", href: "/accounting/journal-entries" },
            ]}
        >
            <Head title="Journal Entries" />

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Journal Entries</h2>
                    <p className="text-muted-foreground">
                        Manage your manual journal entries here.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/accounting/journal-entries/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Entry
                        </Link>
                    </Button>
                </div>
            </div>

            <DataTable
                data={entries}
                columns={columns}
                searchPlaceholder="Search reference or description..."
                baseUrl="/accounting/journal-entries"
            />
        </AppLayout>
    )
}
