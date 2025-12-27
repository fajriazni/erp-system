import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
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
}

interface TemplateLine {
    id: number;
    chart_of_account_id: number;
    debit_credit: 'debit' | 'credit';
    amount_formula: string | null;
    description: string | null;
    sequence: number;
    account: Account;
}

interface Template {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    lines: TemplateLine[];
}

interface Props {
    template: Template;
}

export default function Show({ template }: Props) {
    const handleDelete = () => {
        router.delete(`/accounting/templates/${template.id}`);
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Accounting', href: '/accounting' },
        { title: 'Journal Templates', href: '/accounting/templates' },
        { title: template.name, href: `/accounting/templates/${template.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Template: ${template.name}`} />
            
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title={`Template: ${template.name}`}
                    description="View template details"
                >
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/accounting/templates/${template.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Template
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
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
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
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

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Template Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                                <p className="text-lg font-semibold">{template.name}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                                <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                    {template.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                                <p className="text-base">{template.description || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Template Lines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Seq</TableHead>
                                    <TableHead>Account Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Formula</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {template.lines.map((line) => (
                                    <TableRow key={line.id}>
                                        <TableCell>{line.sequence}</TableCell>
                                        <TableCell className="font-mono">{line.account.code}</TableCell>
                                        <TableCell>{line.account.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={line.debit_credit === 'debit' ? 'outline' : 'secondary'}>
                                                {line.debit_credit.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{line.amount_formula || '-'}</TableCell>
                                        <TableCell>{line.description || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            </div>
        </AppLayout>
    );
}
