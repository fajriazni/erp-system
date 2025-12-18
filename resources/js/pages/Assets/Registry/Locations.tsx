import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function AssetPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Asset Management', href: '/assets' }]}>
            <Head title="Asset Management" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Asset Management Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This feature is currently being implemented.
                </div>
            </div>
        </AppLayout>
    );
}
