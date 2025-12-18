import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Templates() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Journal Templates', href: '#' }]}>
      <Head title="Journal Templates" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Recurring Templates</h2>
         <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
               Template management for recurring journals will appear here.
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
