import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function AdminPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'System Administration', href: '/admin' }]}>
            <Head title="System Administration" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">System Administration Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Admin feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
