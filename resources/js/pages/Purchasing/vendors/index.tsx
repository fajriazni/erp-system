import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { useState } from 'react';
import { index, create, edit, destroy, show } from '@/routes/purchasing/vendors';

export default function VendorIndex({ vendors }: { vendors: any }) {
    const { flash } = usePage().props as any;
    const [deleteId, setDeleteId] = useState<number | null>(null);

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = () => {
        if (deleteId) {
            router.delete(destroy.url(deleteId), {
                onSuccess: () => {
                    toast.success('Vendor deleted successfully');
                    setDeleteId(null);
                },
                onError: () => {
                    toast.error('Failed to delete vendor');
                },
            });
        }
    };

    const columns = [
        {
            label: 'Name',
            key: 'name',
            sortable: true,
            className: 'font-medium',
            render: (vendor: any) => (
                <Link href={show.url(vendor.id)} className="hover:underline text-primary">
                    {vendor.name}
                </Link>
            ),
        },
        {
            label: 'Type',
            key: 'type',
            sortable: true,
            render: (vendor: any) => (
                <Badge variant="outline" className="capitalize">
                    {vendor.type}
                </Badge>
            ),
        },
        {
            label: 'Email',
            key: 'email',
            sortable: true,
        },
        {
            label: 'Phone',
            key: 'phone',
            render: (vendor: any) => vendor.phone || '-',
        },
        {
            label: 'Tax ID',
            key: 'tax_id',
            render: (vendor: any) => vendor.tax_id || '-',
        },
        {
            label: '',
            key: 'actions',
            className: 'text-right',
            render: (vendor: any) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                    >
                        <Link href={edit.url(vendor.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(vendor.id)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendors', href: '/purchasing/vendors' }
        ]}>
            <Head title="Vendors" />
            
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
                    <p className="text-muted-foreground">
                        Manage your vendor contacts and suppliers.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Vendor
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={vendors}
                searchPlaceholder="Search vendors..."
                routeParams={{}}
                baseUrl={index.url()}
            />

            <DeleteConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Vendor"
                description="Are you sure you want to delete this vendor? This action cannot be undone."
            />
        </AppLayout>
    );
}
