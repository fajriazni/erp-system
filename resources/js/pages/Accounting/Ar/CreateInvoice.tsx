import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InvoiceForm from './InvoiceForm';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import * as Invoice from '@/actions/App/Http/Controllers/Accounting/CustomerInvoiceController';

export default function CreateInvoice({ customers, products }: { customers: any[], products: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        lines: [
            { product_id: '', description: '', quantity: 1, unit_price: 0, subtotal: 0 }
        ]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(Invoice.store.url());
    };

  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'New Invoice', href: '#' }]}>
      <Head title="New Invoice" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <PageHeader title="Create Customer Invoice">
            <Button variant="outline" asChild>
                <Link href={Invoice.index.url()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Link>
            </Button>
         </PageHeader>
         
         <InvoiceForm 
            data={data}
            setData={setData}
            errors={errors}
            processing={processing}
            customers={customers}
            products={products}
            onSubmit={handleSubmit}
         />
      </div>
    </AppLayout>
  );
}
