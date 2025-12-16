import { useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { store, update, index } from '@/routes/master/roles';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export default function RoleForm({ role, permissions, rolePermissions = [] }: { role?: any, permissions: Permission[], rolePermissions?: string[] }) {
    const isEditing = !!role;
    
    // Group permissions by prefix (e.g., "users.create" -> group "users")
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const [group] = permission.name.split('.');
        if (!acc[group]) acc[group] = [];
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        permissions: string[];
    }>({
        name: role?.name || '',
        permissions: rolePermissions || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const successMessage = isEditing ? 'Role updated' : 'Role created';
        
        if (isEditing) {
            put(update.url(role.id), {
                onSuccess: () => toast.success(successMessage),
                onError: () => toast.error('Check form for errors'),
            });
        } else {
            post(store.url(), {
                onSuccess: () => toast.success(successMessage),
                onError: () => toast.error('Check form for errors'),
            });
        }
    };

    const togglePermission = (permissionName: string) => {
        const currentPermissions = [...data.permissions];
        if (currentPermissions.includes(permissionName)) {
            setData('permissions', currentPermissions.filter(p => p !== permissionName));
        } else {
            setData('permissions', [...currentPermissions, permissionName]);
        }
    };

    const toggleGroup = (group: string, groupPermissions: Permission[]) => {
        const allGroupNames = groupPermissions.map(p => p.name);
        const hasAll = allGroupNames.every(name => data.permissions.includes(name));
        
        if (hasAll) {
            // Uncheck all
             setData('permissions', data.permissions.filter(p => !allGroupNames.includes(p)));
        } else {
            // Check all (add missing ones)
            const missing = allGroupNames.filter(name => !data.permissions.includes(name));
            setData('permissions', [...data.permissions, ...missing]);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Master Data', href: '#' }, 
            { title: 'Roles', href: '/master/roles' },
            { title: isEditing ? 'Edit Role' : 'Create Role', href: '#' }
        ]}>
            <div className="max-w-4xl">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roles
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? `Edit Role: ${role.name}` : 'Create New Role'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>
                                Define the role name and assign permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Sales Manager"
                                    disabled={role?.name === 'Super Admin'}
                                />
                                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                            </div>

                            <div className="space-y-4">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(groupedPermissions).map(([group, groupPerms]) => (
                                        <div key={group} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <h3 className="font-semibold capitalize">{group}</h3>
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-6 text-xs"
                                                    onClick={() => toggleGroup(group, groupPerms)}
                                                >
                                                    Select All
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {groupPerms.map(permission => (
                                                    <div key={permission.id} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`perm-${permission.id}`} 
                                                            checked={data.permissions.includes(permission.name)}
                                                            onCheckedChange={() => togglePermission(permission.name)}
                                                        />
                                                        <label 
                                                            htmlFor={`perm-${permission.id}`} 
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {permission.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.permissions && <span className="text-sm text-red-500">{errors.permissions}</span>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href={index.url()}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing || role?.name === 'Super Admin'}>
                                {processing ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
