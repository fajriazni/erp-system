import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InvoiceForm from './InvoiceForm';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import * as Invoice from '@/actions/App/Http/Controllers/Accounting/CustomerInvoiceController';

export default function EditInvoice({ invoice, customers, products }: { invoice: any, customers: any[], products: any[] }) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: invoice.customer_id,
        date: invoice.date,
        due_date: invoice.due_date,
        lines: invoice.lines.map((line: any) => ({
            ...line,
            product_id: line.product_id, // ensure it's string if Select expects string but generally value binding handles it
            quantity: parseFloat(line.quantity),
            unit_price: parseFloat(line.unit_price),
            subtotal: parseFloat(line.subtotal)
        }))
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(Invoice.update.url(invoice.id));
    };

    return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Edit Invoice', href: '#' }]}>
      <Head title={`Edit Invoice ${invoice.invoice_number}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <PageHeader title={`Edit Invoice ${invoice.invoice_number}`}>
            <div className="flex gap-2">
                <Button variant="destructive" asChild>
                     <Link href={Invoice.destroy.url(invoice.id)} method="delete" as="button">
                        Delete
                     </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={Invoice.show.url(invoice.id)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to View
                    </Link>
                </Button>
            </div>
         </PageHeader>
         
         <InvoiceForm 
            data={data}
            setData={setData}
            errors={errors}
            processing={processing}
            customers={customers}
            products={products}
            onSubmit={handleSubmit}
            isEditing
         />
      </div>
    </AppLayout>
  );
}
