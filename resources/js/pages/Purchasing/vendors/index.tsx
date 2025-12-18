import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function PurchasingPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }]}>
            <Head title="Purchasing" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Purchasing Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Enterprise Purchasing feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
