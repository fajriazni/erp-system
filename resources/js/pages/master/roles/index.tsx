import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { destroy, create, edit, index } from '@/routes/master/roles';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';

export default function RoleIndex({ roles }: { roles: any }) {
    const { flash } = usePage().props as any;

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => toast.success('Role deleted successfully.'),
            onError: () => toast.error('Failed to delete role.'),
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
            label: "Permissions",
            key: "permissions_count",
            sortable: true, // Note: sorting by count requires backend support, Spatie usually does not support it out of box on count
            render: (role: any) => (
                <Badge variant="secondary">
                    {role.permissions_count} Permissions
                </Badge>
            )
        },
        {
            label: "Created At",
            key: "created_at",
            sortable: true,
            render: (role: any) => new Date(role.created_at).toLocaleDateString()
        },
        {
            label: "",
            key: "actions",
            className: "text-right",
            render: (role: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(role.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <DeleteConfirmDialog
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                disabled={role.name === 'Super Admin'}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                        onConfirm={() => handleDelete(role.id)}
                        title="Delete Role?"
                        description={`Are you sure you want to delete the "${role.name}" role? This action cannot be undone.`}
                    />
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Master Data', href: '#' }, { title: 'Roles', href: '/master/roles' }]}>
            <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
                    <p className="text-muted-foreground">
                        Manage roles and their permissions.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Role
                    </Link>
                </Button>
            </div>

            <DataTable
                data={roles}
                columns={columns}
                searchPlaceholder="Search roles..."
                baseUrl={index.url()}
            />
        </AppLayout>
    );
}
