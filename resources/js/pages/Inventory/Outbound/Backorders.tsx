import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Backorders() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Backorders', href: '#' }]}>
      <Head title="Backorders" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Backorder Management</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Backorder listing and allocation logic will appear here.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
