import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Props {
    moduleName: string;
}

export default function ModuleDashboard({ moduleName }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: moduleName, href: '#' }, { title: 'Dashboard', href: '#' }]}>
            <Head title={`${moduleName} Dashboard`} />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center text-xl font-bold text-muted-foreground">
                        {moduleName} Stat 1
                    </div>
                    <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center text-xl font-bold text-muted-foreground">
                         {moduleName} Stat 2
                    </div>
                    <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center text-xl font-bold text-muted-foreground">
                         {moduleName} Stat 3
                    </div>
                </div>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
                    <h2 className="text-2xl font-bold mb-4">Welcome to {moduleName} Module</h2>
                    <p className="text-muted-foreground">This is the dashboard for the {moduleName} module.</p>
                </div>
            </div>
        </AppLayout>
    );
}
