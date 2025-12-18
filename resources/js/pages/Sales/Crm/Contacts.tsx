import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function SalesPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales & CRM', href: '/sales' }]}>
            <Head title="Sales & CRM" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Sales & CRM Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Enterprise Sales & CRM feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
