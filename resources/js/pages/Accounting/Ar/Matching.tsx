import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Matching() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Payment Matching', href: '#' }]}>
      <Head title="Matching" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Payment Matching</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Payment reconciliation tools will appear here.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
