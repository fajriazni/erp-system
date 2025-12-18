import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function DashboardPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Dashboard Section</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Enterprise Command Center feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
