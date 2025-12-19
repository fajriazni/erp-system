import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';
import { PageHeader } from '@/components/ui/page-header';
import { index, update } from '@/routes/purchasing/rfqs';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    rfq: { id: number; document_number: string };
    products: { id: number; name: string; code: string; uom_id?: number | null }[];
    uoms: { id: number; name: string; symbol: string }[];
    initialData: {
        title: string;
        deadline: string;
        notes: string;
        items: { product_id: string; quantity: number | string; uom_id: string; target_price: number | string; notes: string }[];
    };
}

export default function Edit({ rfq, products, uoms, initialData }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'RFQs', href: index.url() },
            { title: rfq.document_number, href: `/purchasing/rfqs/${rfq.id}` }, // Ideally link to show
            { title: 'Edit' }
        ]}>
            <Head title={`Edit ${rfq.document_number}`} />
            
            <PageHeader 
                title={`Edit ${rfq.document_number}`} 
                description="Update tender details."
            >
                <Button variant="outline" asChild>
                    <Link href={index.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>
            </PageHeader>

            <div className="container mx-auto max-w-full">
                <Form 
                    products={products}
                    uoms={uoms}
                    initialData={initialData}
                    submitUrl={update.url(rfq.id)}
                    method="put"
                    cancelUrl={index.url()}
                    isEdit
                />
            </div>
        </AppLayout>
    );
}
