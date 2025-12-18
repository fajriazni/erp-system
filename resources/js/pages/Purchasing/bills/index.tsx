import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { index, create, show } from '@/routes/purchasing/bills';
import { create as createPayment } from '@/routes/purchasing/payments';

interface Props {
    bills: {
        data: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ bills }: Props) {
    const formatDate = (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const columns = [
        {
            label: "Bill #",
            key: "bill_number",
            sortable: true,
            className: "font-medium",
            render: (bill: any) => (
                <Link href={show.url(bill.id)} className="hover:underline">
                    {bill.bill_number}
                </Link>
            )
        },
        {
            label: "Reference",
            key: "reference_number",
        },
        {
            label: "Vendor",
            key: "vendor.name",
            render: (bill: any) => bill.vendor?.name || 'N/A'
        },
        {
            label: "Date",
            key: "date",
            sortable: true,
            render: (bill: any) => formatDate(bill.date)
        },
        {
            label: "Due Date",
            key: "due_date",
            sortable: true,
            render: (bill: any) => formatDate(bill.due_date)
        },
        {
            label: "Status",
            key: "status",
            sortable: true,
            render: (bill: any) => {
                const variants: Record<string, { variant: any; label: string; className?: string }> = {
                    draft: { variant: 'secondary', label: 'Draft' },
                    posted: { variant: 'default', label: 'Posted' },
                    partial: { variant: 'outline', label: 'Partial', className: 'text-orange-600 border-orange-600 bg-orange-50' },
                    paid: { variant: 'outline', label: 'Paid', className: 'text-green-600 border-green-600 bg-green-50' },
                    cancelled: { variant: 'destructive', label: 'Cancelled' },
                };
                const config = variants[bill.status] || { variant: 'outline', label: bill.status };
                return <Badge variant={config.variant} className={config.className || ''}>{config.label}</Badge>;
            }
        },
        {
            label: "Amount",
            key: "total_amount",
            sortable: true,
            className: "text-right",
            render: (bill: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(bill.total_amount)
        },
        {
            label: "Balance Due",
            key: "balance_due",
            sortable: false,
            className: "text-right font-semibold text-red-600",
            render: (bill: any) => {
                if (bill.status === 'paid') return '-';
                return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(bill.balance_due);
            }
        },
        {
            label: "Action",
            key: "actions",
            className: "w-[50px]",
            render: (bill: any) => {
                if ((bill.status === 'posted' || bill.status === 'partial') && bill.balance_due > 0) {
                    return (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild title="Record Payment">
                            <Link href={`${createPayment.url()}?vendor_id=${bill.vendor_id}`}>
                                <Wallet className="h-4 w-4 text-green-600" />
                            </Link>
                        </Button>
                    );
                }
                return null;
            }
        }
    ];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Purchasing', href: '/purchasing' },
                { title: 'Vendor Bills', href: index.url() },
            ]}
        >
            <Head title="Vendor Bills" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vendor Bills</h1>
                    <p className="text-muted-foreground">
                        Manage vendor invoices and payments.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create.url()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Bill
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={bills}
                searchPlaceholder="Search bills..."
                routeParams={{}}
                baseUrl={index.url()}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { label: "Draft", value: "draft" },
                            { label: "Posted", value: "posted" },
                            { label: "Paid", value: "paid" },
                            { label: "Cancelled", value: "cancelled" },
                        ]
                    }
                ]}
            />
        </AppLayout>
    );
}
