import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Waves() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Wave Picking', href: '#' }]}>
      <Head title="Wave Picking" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Wave Picking</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Wave planning and grouping dashboard will appear here.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
