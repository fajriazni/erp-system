import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import TemplateForm from './TemplateForm';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    label: string;
}

interface Props {
    accounts: Account[];
}

export default function Create({ accounts }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Accounting', href: '/accounting' },
        { title: 'Journal Templates', href: '/accounting/templates' },
        { title: 'Create', href: '/accounting/templates/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Journal Template" />
            
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Create Journal Template"
                    description="Create a reusable template for journal entries"
                >
                    <Button variant="outline" asChild>
                        <Link href="/accounting/templates">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </PageHeader>

                <TemplateForm 
                    accounts={accounts}
                    submitUrl="/accounting/templates"
                    submitMethod="post"
                    submitLabel="Create Template"
                />
            </div>
        </AppLayout>
    );
}
