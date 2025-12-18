import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { index, create, edit } from '@/routes/purchasing/pricelists';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

export default function Index({ pricelists }: { pricelists: any }) {
    const columns = [
        {
            label: 'Vendor',
            key: 'vendor.name',
            sortable: true,
            className: 'font-medium',
            render: (row: any) => row.vendor?.name,
        },
        {
            label: 'Product',
            key: 'product.name',
            sortable: true,
            render: (row: any) => (
                <div>
                    <div>{row.product?.name}</div>
                    <div className="text-xs text-muted-foreground">{row.product?.code}</div>
                </div>
            )
        },
        {
            label: 'Vendor SKU',
            key: 'vendor_product_code',
            sortable: true,
            className: 'hidden md:table-cell',
            render: (row: any) => row.vendor_product_code || '-',
        },
        {
            label: 'Min Qty',
            key: 'min_quantity',
            sortable: true,
            className: 'text-right',
             render: (row: any) => new Intl.NumberFormat('id-ID').format(row.min_quantity),
        },
        {
            label: 'Price',
            key: 'price',
            sortable: true,
            className: 'text-right font-medium',
            render: (row: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.price),
        },
        {
            label: '',
            key: 'actions',
            className: 'text-right',
            render: (row: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(row.id)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Pricelist?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this pricelist? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => router.delete(edit.url(row.id))}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Price Lists', href: index.url() }
        ]}>
            <Head title="Price Lists" />
            
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Price Lists</h1>
                        <p className="text-muted-foreground">Manage vendor-specific pricing and tiers.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> Create Pricelist
                        </Link>
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={pricelists}
                    searchPlaceholder="Search vendor, product..."
                    routeParams={{}}
                    baseUrl={index.url()}
                />
            </div>
        </AppLayout>
    );
}
