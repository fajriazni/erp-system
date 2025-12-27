import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import VendorBillForm from './components/VendorBillForm';
import { index } from '@/routes/accounting/bills';

interface Props {
    purchaseOrder?: any;
    vendors: { id: number; company_name: string; name: string }[];
    products: any[];
    paymentSchedule?: any[];
}

export default function Create({ purchaseOrder, vendors, products, paymentSchedule = [] }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Vendor Bills', href: index.url() },
                { title: 'Create', href: '#' },
            ]}
        >
            <Head title="Create Vendor Bill" />
            <VendorBillForm
                purchaseOrder={purchaseOrder}
                vendors={vendors}
                products={products}
                paymentSchedule={paymentSchedule}
            />
        </AppLayout>
    );
}
