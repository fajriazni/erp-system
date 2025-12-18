import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function PosPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Point of Sale', href: '/pos' }]}>
            <Head title="Point of Sale" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">POS Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This POS feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
