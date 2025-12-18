import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { useState } from 'react';
import { index, create, edit, destroy } from '@/routes/purchasing/payment-terms'; 

export default function PaymentTermIndex({ terms }: { terms: any }) {
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
                    setDeleteId(null);
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
        },
        {
            label: 'Type',
            key: 'type',
            sortable: true,
            render: (term: any) => (
                <Badge variant={term.type === 'standard' ? 'secondary' : 'default'} className="capitalize">
                    {term.type}
                </Badge>
            ),
        },
        {
            label: 'Description',
            key: 'description',
            render: (term: any) => term.description || '-',
        },
        {
            label: 'Details',
            key: 'details',
            render: (term: any) => {
                if (term.type === 'standard') {
                    return <span>Due in {term.days_due} days</span>;
                }
                return <span>{term.schedule_definition?.length || 0} Installments</span>;
            }
        },
        {
            label: '',
            key: 'actions',
            className: 'text-right',
            render: (term: any) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                    >
                        <Link href={edit.url(term.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(term.id)}
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
            { title: 'Payment Terms', href: index.url() }
        ]}>
            <Head title="Payment Terms" />
            
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payment Terms</h1>
                    <p className="text-muted-foreground">
                        Manage payment schedules and terms.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" /> Create Term
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={terms}
                searchPlaceholder="Search terms..."
                routeParams={{}}
                baseUrl={index.url()}
            />

            <DeleteConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Payment Term"
                description="Are you sure you want to delete this payment term? It cannot be deleted if it is in use."
            />
        </AppLayout>
    );
}
