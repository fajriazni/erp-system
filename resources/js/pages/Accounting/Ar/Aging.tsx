import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Aging() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'AR Aging', href: '#' }]}>
      <Head title="AR Aging" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Receivable Aging Report</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Aging analysis will appear here.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
