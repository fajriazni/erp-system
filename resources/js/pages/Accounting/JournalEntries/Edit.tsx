import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Edit() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Journal Entries', href: '/accounting/journal-entries' }, { title: 'Edit', href: '#' }]}>
            <Head title="Edit Journal Entry" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Edit Journal Entry</h1>
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This feature is under development.
                </div>
            </div>
        </AppLayout>
    );
}
