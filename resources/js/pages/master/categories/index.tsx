import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { destroy, create, edit } from '@/routes/master/categories';

import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { index } from '@/routes/master/categories';

export default function CategoryIndex({ categories }: { categories: any }) {
    const { flash } = usePage().props as any;

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => toast.success('Category deleted successfully.'),
            onError: () => toast.error('Failed to delete category.'),
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
            label: "Type",
            key: "type",
            sortable: true,
            render: (category: any) => (
                <Badge variant={category.type === 'product' ? 'default' : 'secondary'}>
                    {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                </Badge>
            )
        },
        {
            label: "",
            key: "actions",
            className: "text-right",
            render: (category: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(category.id)}>
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
                        onConfirm={() => handleDelete(category.id)}
                        title="Delete Category?"
                        description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
                    />
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Master Data', href: '#' }, { title: 'Categories', href: '/master/categories' }]}>
            <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">
                        Manage product and contact categories.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Link>
                </Button>
            </div>

            <DataTable
                data={categories}
                columns={columns}
                searchPlaceholder="Search categories..."
                routeParams={{}}
                baseUrl={index.url()}
                filters={[
                    {
                        key: "type",
                        label: "Type",
                        options: [
                           { label: "Product", value: "product" },
                           { label: "Contact", value: "contact" },
                        ]
                    }
                ]}
            />
        </AppLayout>
    );
}
