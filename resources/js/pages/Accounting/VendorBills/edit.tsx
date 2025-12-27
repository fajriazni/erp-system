import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import VendorBillForm from './components/VendorBillForm';
import { index, show } from '@/routes/accounting/bills';

interface Props {
    bill: any;
    vendors: { id: number; company_name: string; name: string }[];
    products: any[];
    paymentSchedule?: any[];
}

export default function Edit({ bill, vendors, products, paymentSchedule = [] }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Vendor Bills', href: index.url() },
                { title: bill.bill_number, href: show.url(bill.id) },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit Bill ${bill.bill_number}`} />
            <VendorBillForm
                bill={bill}
                vendors={vendors}
                products={products}
                paymentSchedule={paymentSchedule}
            />
        </AppLayout>
    );
}
