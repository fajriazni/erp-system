

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { index, create, show } from '@/routes/accounting/vendor-payments';

interface Payment {
    id: number;
    payment_number: string;
    date: string;
    amount: number;
    vendor: {
        id: number;
        name: string;
    };
    payment_method: string;
    status: string;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(Number(amount));
};

const columns = [
    {
        label: 'Payment #',
        key: 'payment_number',
        sortable: true,
        render: (row: Payment) => (
            <Link href={show.url(row.id)} className="font-medium text-blue-600 hover:underline">
                {row.payment_number}
            </Link>
        ),
    },
    {
        label: 'Date',
        key: 'date',
        sortable: true,
        render: (row: Payment) => formatDate(row.date),
    },
    {
        label: 'Vendor',
        key: 'vendor.name',
        render: (row: Payment) => row.vendor?.name,
    },
    {
        label: 'Amount',
        key: 'amount',
        sortable: true,
        render: (row: Payment) => formatCurrency(row.amount),
    },
    {
        label: 'Method',
        key: 'payment_method',
        render: (row: Payment) => (
            <span className="capitalize">
                {row.payment_method?.replace('_', ' ')}
            </span>
        ),
    },
    {
        label: 'Status',
        key: 'status',
        sortable: true,
        render: (row: Payment) => <Badge variant="outline">{row.status}</Badge>,
    },
];

export default function Index({ payments }: { payments: any }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Vendor Payments' }]}>
            <Head title="Vendor Payments" />
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Vendor Payments</h1>
                        <p className="text-muted-foreground">Manage payments to vendors.</p>
                    </div>
                    <Link href={create.url()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Record Payment
                        </Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800">
                   <DataTable columns={columns} data={payments} baseUrl={index.url()} />
                </div>
            </div>
        </AppLayout>
    );
}
