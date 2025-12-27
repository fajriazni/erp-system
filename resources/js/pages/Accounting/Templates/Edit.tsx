import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import TemplateForm from './TemplateForm';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    label: string;
}

interface TemplateLine {
    id: number;
    chart_of_account_id: number;
    debit_credit: 'debit' | 'credit';
    amount_formula: string | null;
    description: string | null;
}

interface Template {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    lines: TemplateLine[];
}

interface Props {
    template: Template;
    accounts: Account[];
}

export default function Edit({ template, accounts }: Props) {
    // Transform template lines to match Create form structure (handling nulls)
    const initialLines = template.lines.map(line => ({
        id: line.id,
        chart_of_account_id: line.chart_of_account_id,
        debit_credit: line.debit_credit,
        amount_formula: line.amount_formula || '',
        description: line.description || '',
    }));

    const initialData = {
        name: template.name,
        description: template.description || '',
        is_active: template.is_active,
        lines: initialLines,
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Accounting', href: '/accounting' },
        { title: 'Journal Templates', href: '/accounting/templates' },
        { title: 'Edit', href: `/accounting/templates/${template.id}/edit` },
    ];

    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        router.delete(`/accounting/templates/${template.id}`, {
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Template: ${template.name}`} />
            
            <div className="flex flex-1 flex-col gap-2 pt-0">
                <PageHeader
                    title={`Edit Template: ${template.name}`}
                    description="Update template details and lines"
                >
                    <div className="flex items-center gap-2">
                        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="destructive"
                                    onClick={() => setDeleteId(template.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the template
                                        and remove it from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button variant="outline" asChild>
                            <Link href="/accounting/templates">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                            </Link>
                        </Button>
                    </div>
                </PageHeader>

                <TemplateForm 
                    accounts={accounts}
                    initialData={initialData}
                    submitUrl={`/accounting/templates/${template.id}`}
                    submitMethod="put"
                    submitLabel="Update Template"
                />
            </div>
        </AppLayout>
    );
}
