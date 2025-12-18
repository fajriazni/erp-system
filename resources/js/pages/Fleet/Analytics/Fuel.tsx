import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function FleetPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Fleet Management', href: '/fleet' }]}>
            <Head title="Fleet Management" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Fleet Management Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Fleet feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
