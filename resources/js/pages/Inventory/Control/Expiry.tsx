import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Expiry() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Expiry Management', href: '#' }]}>
      <Head title="Expiry" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Expiry Dates</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Expiration monitoring dashboard.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
