import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function CrossDock() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Cross-Docking', href: '#' }]}>
      <Head title="Cross-Docking" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Cross-Docking Dashboard</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Cross-docking operations and immediate routing logic will appear here.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
