import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Placeholder() {
    return (
        <AppLayout>
            <Head title="Under Development" />
            <div className="flex flex-col gap-4 p-4">
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    This feature is under development.
                </div>
            </div>
        </AppLayout>
    );
}
