import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function BiPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Business Intelligence', href: '/bi' }]}>
            <Head title="Business Intelligence" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Business Intelligence Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This BI feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
