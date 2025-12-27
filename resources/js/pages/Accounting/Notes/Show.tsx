import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { ArrowLeft, Edit, FileText, User, Printer, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/use-currency';
import { index, edit } from '@/routes/accounting/notes';

interface Props {
    note: {
        id: number;
        type: 'credit' | 'debit';
        reference_number: string;
        date: string;
        amount: number;
        remaining_amount: number;
        reason: string;
        status: string;
        contact: {
            name: string;
            company_name?: string;
            email?: string;
            phone?: string;
        };
        reference_type?: string;
        reference_id?: number;
    };
    reference?: any;
}

export default function Show({ note, reference }: Props) {
    const { format } = useCurrency();
    const [processing, setProcessing] = useState(false);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handlePost = () => {
        setProcessing(true);
        router.post(route('accounting.notes.post', note.id), {}, {
            onSuccess: () => {
                toast.success('Note posted successfully.');
                setProcessing(false);
            },
            onError: () => {
                toast.error('Failed to post note.');
                setProcessing(false);
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { className: string; label: string }> = {
            draft: { className: 'bg-gray-100 text-gray-800', label: 'Draft' },
            posted: { className: 'bg-blue-100 text-blue-800', label: 'Posted' },
            applied: { className: 'bg-green-100 text-green-800', label: 'Applied' },
            void: { className: 'bg-red-100 text-red-800', label: 'Void' },
        };
        const config = variants[status] || { className: 'bg-gray-100 text-gray-800', label: status };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Accounting', href: '/accounting' },
            { title: 'Credit/Debit Notes', href: index.url() },
            { title: note.reference_number, href: '#' }
        ]}>
            <Head title={`${note.type === 'credit' ? 'Credit' : 'Debit'} Note ${note.reference_number}`} />

            <div>
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        {note.status === 'draft' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={edit.url(note.id)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={processing}>
                                            {processing ? 'Posting...' : 'Post Note'}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Post {note.type === 'credit' ? 'Credit' : 'Debit'} Note?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will generate a Journal Entry and make this amount available for allocation.
                                                <br /><br />
                                                <strong>Credit Note:</strong> Debit Sales Returns / Credit AR<br />
                                                <strong>Debit Note:</strong> Debit AP / Credit Purchase Returns
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handlePost}>Post Note</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {note.type === 'credit' ? 'Customer' : 'Vendor'} Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                                    <div>{note.contact.company_name || note.contact.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                                    <div>{note.contact.email || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                    <div>{note.contact.phone || '-'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4" />
                                    Note Summary
                                </CardTitle>
                                <CardDescription>Financial overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">Total Amount</div>
                                    <div className="text-xl font-bold text-blue-600">{format(note.amount)}</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">Remaining / Available</div>
                                    <div className="text-xl font-bold text-green-600">{format(note.remaining_amount)}</div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                                    <div>{getStatusBadge(note.status)}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            {note.type === 'credit' ? 'Credit Note' : 'Debit Note'} Details
                                        </CardTitle>
                                        <CardDescription>
                                            {note.reference_number} • Created on {formatDate(note.date)}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Reference Number</span>
                                        <p className="font-medium text-lg">{note.reference_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Date</span>
                                        <p className="font-medium">{formatDate(note.date)}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Reason / Description</span>
                                    <p className="whitespace-pre-wrap mt-1 text-muted-foreground">{note.reason}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {reference && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Linked Document
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Document #</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">
                                                    {note.reference_type === 'invoice' ? 'Customer Invoice' : 'Vendor Bill'}
                                                </TableCell>
                                                <TableCell>
                                                    <Link href="#" className="text-primary hover:underline">
                                                        {reference.reference_number || reference.document_number || reference.invoice_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {format(reference.total_amount || reference.amount || 0)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
