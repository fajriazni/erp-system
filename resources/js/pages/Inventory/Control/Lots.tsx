import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Lots() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Lot/Serial Numbers', href: '#' }]}>
      <Head title="Lots & Serials" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Traceability</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Lot and serial number tracking dashboard.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
