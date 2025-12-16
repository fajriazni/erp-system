import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { destroy, create, edit } from '@/routes/master/products';

import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { index } from '@/routes/master/products';

export default function ProductIndex({ products }: { products: any }) {
    const { flash } = usePage().props as any;

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => toast.success('Product deleted successfully.'),
            onError: () => toast.error('Failed to delete product.'),
        });
    };

    const columns = [
        {
            label: "Code",
            key: "code",
            sortable: true,
            className: "font-mono"
        },
        {
            label: "Name",
            key: "name",
            sortable: true,
            className: "font-medium"
        },
        {
            label: "Type",
            key: "type",
            render: (product: any) => (
                <Badge variant={product.type === 'goods' ? 'default' : 'secondary'}>
                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </Badge>
            )
        },
        {
            label: "Price",
            key: "price",
            sortable: true,
            className: "text-right",
            render: (product: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)
        },
        {
            label: "Stock",
            key: "stock_control",
            className: "text-center",
            render: (product: any) => product.stock_control ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
        },
        {
            label: "",
            key: "actions",
            className: "text-right",
            render: (product: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(product.id)}>
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
                        onConfirm={() => handleDelete(product.id)}
                        title="Delete Product?"
                        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                    />
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Master Data', href: '#' }, { title: 'Products', href: '/master/products' }]}>
            <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your goods and services.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={products}
                searchPlaceholder="Search products..."
                routeParams={{}}
                baseUrl={index.url()}
                filters={[
                    {
                        key: "type",
                        label: "Type",
                        options: [
                            { label: "Goods", value: "goods" },
                            { label: "Service", value: "service" },
                        ],
                    },
                    {
                        key: "stock_control",
                        label: "Stock Control",
                        options: [
                            { label: "Yes", value: "1" },
                            { label: "No", value: "0" },
                        ],
                    },
                ]}
            />
        </AppLayout>
    );
}
