import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function PlaceholderPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Project Management', href: '/projects' }]}>
            <Head title="Work In Progress" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Work in Progress</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This module is currently under development.
                </div>
            </div>
        </AppLayout>
    );
}
