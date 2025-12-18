import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function AccountingPlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }]}>
            <Head title="Accounting" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Accounting Module</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This Enterprise Accounting feature is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
