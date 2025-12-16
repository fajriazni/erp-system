import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { destroy, create, edit } from '@/routes/master/contacts';

import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { index } from '@/routes/master/contacts';

export default function ContactIndex({ contacts }: { contacts: any }) {
    const { flash } = usePage().props as any;

    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => toast.success('Contact deleted successfully.'),
            onError: () => toast.error('Failed to delete contact.'),
        });
    };

    const columns = [
        {
            label: "Name",
            key: "name",
            sortable: true,
            className: "font-medium",
            render: (contact: any) => (
                <>
                    {contact.name}
                    {contact.tax_id && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Tax ID: {contact.tax_id}
                        </div>
                    )}
                </>
            )
        },
        {
            label: "Type",
            key: "type",
            render: (contact: any) => (
                <Badge variant={contact.type === 'customer' ? 'default' : (contact.type === 'vendor' ? 'secondary' : 'outline')}>
                     {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                </Badge>
            )
        },
        {
            label: "Info",
            key: "email",
            render: (contact: any) => (
                <div className="flex flex-col text-sm">
                    {contact.email && <span className="text-muted-foreground">{contact.email}</span>}
                    {contact.phone && <span>{contact.phone}</span>}
                </div>
            )
        },
        {
            label: "Address",
            key: "address",
            className: "max-w-[200px] truncate",
            render: (contact: any) => <span className="truncate">{contact.address || '-'}</span>
        },
        {
            label: "",
            key: "actions",
            className: "text-right",
            render: (contact: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit.url(contact.id)}>
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
                        onConfirm={() => handleDelete(contact.id)}
                        title="Delete Contact?"
                        description={`Are you sure you want to delete "${contact.name}"? This action cannot be undone.`}
                    />
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Master Data', href: '#' }, { title: 'Contacts', href: '/master/contacts' }]}>
            <div className="flex items-center justify-between mb-6">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
                    <p className="text-muted-foreground">
                        Manage customers, vendors, and partners.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Contact
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={contacts}
                searchPlaceholder="Search contacts..."
                routeParams={{}}
                baseUrl={index.url()}
                filters={[
                    {
                        key: "type",
                        label: "Type",
                        options: [
                            { label: "Customer", value: "customer" },
                            { label: "Vendor", value: "vendor" },
                            { label: "Both", value: "both" },
                        ],
                    },
                ]}
            />
        </AppLayout>
    );
}
