import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function ManufacturingPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Manufacturing', href: '/mrp' }]}>
            <Head title="Manufacturing" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Manufacturing Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Enterprise Manufacturing (MRP) feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
