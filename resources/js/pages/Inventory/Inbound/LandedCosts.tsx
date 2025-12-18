import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function LandedCosts() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Landed Costs', href: '#' }]}>
      <Head title="Landed Costs" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Landed Cost Allocation</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Landed cost allocation tools and history will appear here.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
