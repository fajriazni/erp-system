import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function HrmPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }]}>
            <Head title="HRM" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">HRM Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Enterprise HRM feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
