import AppLayout from "@/layouts/app-layout"
import { Head, Link, router } from "@inertiajs/react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Pencil } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AssetCategoriesIndex({ categories }: { categories: any }) {
    const columns = [
        {
            label: "Name",
            key: "name",
            sortable: true,
            render: (row: any) => (
                <div className="font-medium">
                    <Link href={`/accounting/assets/categories/${row.id}/edit`} className="hover:underline text-primary">
                        {row.name}
                    </Link>
                </div>
            )
        },
        {
            label: "Code",
            key: "code",
            sortable: true,
        },
        {
            label: "Useful Life (Years)",
            key: "useful_life_years",
        },
        {
            label: "Method",
            key: "depreciation_method",
            render: (row: any) => row.depreciation_method.replace('_', ' ').toUpperCase()
        },
        {
            label: "Asset Account",
            key: "assetAccount.name",
            render: (row: any) => row.asset_account?.name || 'N/A'
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
                        <DropdownMenuItem onClick={() => router.visit(`/accounting/assets/categories/${row.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
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
                { title: "Review", href: "/accounting" },
                { title: "Asset Categories", href: "/accounting/assets/categories" },
            ]}
        >
            <Head title="Asset Categories" />

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Asset Categories</h2>
                    <p className="text-muted-foreground">
                        Manage asset categories and their default GL accounts.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/accounting/assets/categories/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Category
                        </Link>
                    </Button>
                </div>
            </div>

            <DataTable
                data={categories}
                columns={columns}
                searchPlaceholder="Search category name..."
                baseUrl="/accounting/assets/categories"
            />
        </AppLayout>
    )
}
