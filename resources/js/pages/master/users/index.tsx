import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { destroy, create, edit, index } from '@/routes/master/users';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';

export default function UserIndex({ users, roles }: { users: any, roles: string[] }) {
    const { flash } = usePage().props as any;

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => toast.success('User deleted successfully.'),
            onError: () => toast.error('Failed to delete user.'),
        });
    };

    const columns = [
        {
            label: "Name",
            key: "name",
            sortable: true,
            className: "font-medium",
            render: (user: any) => (
                <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            )
        },
        {
            label: "Roles",
            key: "roles",
            render: (user: any) => (
                <div className="flex flex-wrap gap-1">
                    {(user.roles || []).map((role: any) => (
                        <Badge key={role.id} variant="secondary">
                            {role.name}
                        </Badge>
                    ))}
                </div>
            )
        },
        {
            label: "Created At",
            key: "created_at",
            sortable: true,
            render: (user: any) => new Date(user.created_at).toLocaleDateString()
        },
        {
            label: "",
            key: "actions",
            className: "text-right",
            render: (user: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(user.id)}>
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
                        onConfirm={() => handleDelete(user.id)}
                        title="Delete User?"
                        description={`Are you sure you want to delete "${user.name}"? This action cannot be undone.`}
                    />
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Master Data', href: '#' }, { title: 'User Management', href: '/master/users' }]}>
            <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage system users and their roles.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                searchPlaceholder="Search users..."
                routeParams={{}}
                baseUrl={index.url()}
                filters={[
                    {
                        key: "role",
                        label: "Role",
                        options: roles.map(role => ({ label: role, value: role })),
                    },
                ]}
            />
        </AppLayout>
    );
}
