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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AssetsIndex({ assets }: { assets: any }) {
    const columns = [
        {
            label: "Asset #",
            key: "asset_number",
            sortable: true,
            render: (row: any) => (
                <div className="font-medium">
                    <Link href={`/accounting/assets/${row.id}`} className="hover:underline text-primary">
                        {row.asset_number}
                    </Link>
                </div>
            )
        },
        {
            label: "Name",
            key: "name",
            sortable: true,
        },
        {
            label: "Category",
            key: "category.name",
            render: (row: any) => row.category?.name || 'N/A'
        },
        {
            label: "Purchase Date",
            key: "purchase_date",
            sortable: true,
            render: (row: any) => format(new Date(row.purchase_date), "PP")
        },
         {
            label: "Cost",
            key: "cost",
            sortable: true,
             render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.cost)
        },
        {
            label: "Book Value",
            key: "book_value", // Assuming appended attribute or calculated on fly, for index might need to be raw or loaded
             render: (row: any) => {
                 // Note: 'book_value' attribute is an accessor, ensure it's included in JSON serialization if used here directly, 
                 // otherwise we might need to rely on what's passed. 
                 // For performance in large lists, better to calculate or cache. 
                 // Here relying on model appends or resource transformation if applied.
                 // If not appended, we might show 'N/A' or cost initially.
                 // Let's assume for now the controller didn't append it explicitly in pagination, so we might skip or check.
                 return row.book_value !== undefined 
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.book_value)
                    : '-' 
             }
        },
        {
            label: "Status",
            key: "status",
            render: (row: any) => (
                <Badge variant={row.status === 'active' ? 'default' : (row.status === 'fully_depreciated' ? 'secondary' : 'outline')}>
                  {row.status.replace('_', ' ')}
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
                        <DropdownMenuItem onClick={() => router.visit(`/accounting/assets/${row.id}`)}>
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
                { title: "Accounting", href: "/accounting" },
                { title: "Assets", href: "/accounting/assets" },
            ]}
        >
            <Head title="Fixed Assets" />

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Fixed Assets</h2>
                    <p className="text-muted-foreground">
                        Track and manage your company's fixed assets.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                     <Button variant="outline" asChild>
                        <Link href="/accounting/assets/categories">
                            Manage Categories
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/accounting/assets/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Asset
                        </Link>
                    </Button>
                </div>
            </div>

            <DataTable
                data={assets}
                columns={columns}
                searchPlaceholder="Search asset name or number..."
                baseUrl="/accounting/assets"
            />
        </AppLayout>
    )
}
