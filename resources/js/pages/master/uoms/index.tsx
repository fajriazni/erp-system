import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { destroy, create, edit, index } from '@/routes/master/uoms';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';

export default function UomIndex({ uoms }: { uoms: any }) {
    const { flash } = usePage().props as any;

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => toast.success('Unit deleted successfully.'),
            onError: () => toast.error('Failed to delete unit.'),
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
            label: "Symbol",
            key: "symbol",
            sortable: true,
             render: (uom: any) => <Badge variant="outline">{uom.symbol}</Badge>
        },
        {
            label: "",
            key: "actions",
            className: "text-right",
            render: (uom: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(uom.id)}>
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
                        onConfirm={() => handleDelete(uom.id)}
                        title="Delete Unit?"
                        description={`Are you sure you want to delete "${uom.name}"? This action cannot be undone.`}
                    />
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Master Data', href: '#' }, { title: 'Units of Measure', href: '/master/uoms' }]}>
            <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Units of Measure</h1>
                    <p className="text-muted-foreground">
                        Manage measurement units for products.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Unit
                    </Link>
                </Button>
            </div>

            <DataTable
                data={uoms}
                columns={columns}
                searchPlaceholder="Search units..."
                baseUrl={index.url()}
            />
        </AppLayout>
    );
}
