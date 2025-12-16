import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { destroy, create, edit } from '@/routes/master/warehouses';

import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { index } from '@/routes/master/warehouses';

export default function WarehouseIndex({ warehouses }: { warehouses: any }) {
    const { flash } = usePage().props as any;

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => toast.success('Warehouse deleted successfully.'),
            onError: () => toast.error('Failed to delete warehouse.'),
        });
    };

    const columns = [
        {
            label: "Name",
            key: "name",
            sortable: true,
            className: "font-medium"
        },
        {
            label: "Address",
            key: "address",
            sortable: true,
            render: (warehouse: any) => <span className="truncate max-w-[300px] block">{warehouse.address || '-'}</span>
        },
        {
            label: "",
            key: "actions",
            className: "text-right",
            render: (warehouse: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(warehouse.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <DeleteConfirmDialog
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                        onConfirm={() => handleDelete(warehouse.id)}
                        title="Delete Warehouse?"
                        description={`Are you sure you want to delete "${warehouse.name}"? This action cannot be undone.`}
                    />
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Master Data', href: '#' }, { title: 'Warehouses', href: '/master/warehouses' }]}>
            <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Warehouses</h1>
                    <p className="text-muted-foreground">
                        Manage inventory locations.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                    </Link>
                </Button>
            </div>

            <DataTable
                data={warehouses}
                columns={columns}
                searchPlaceholder="Search warehouses..."
                baseUrl={index.url()}
            />
        </AppLayout>
    );
}
