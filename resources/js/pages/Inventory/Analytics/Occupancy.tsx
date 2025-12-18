import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Page() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Warehouse Occupancy', href: '#' }]}>
            <Head title="Warehouse Occupancy" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl bg-muted/50">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Warehouse Occupancy Module</h2>
                        <p className="text-muted-foreground">This module is part of the Enterprise WMS system and is currently under development.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
