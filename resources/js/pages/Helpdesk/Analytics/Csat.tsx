import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function HelpdeskPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Helpdesk (CSM)', href: '/helpdesk' }]}>
            <Head title="Helpdesk" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Helpdesk Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Helpdesk feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
