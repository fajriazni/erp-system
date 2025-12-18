import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Moves() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }]}>
            <Head title="Inventory Moves" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Inventory Moves</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This feature is under development.
                </div>
            </div>
        </AppLayout>
    );
}
