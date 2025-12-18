import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { 
    ArrowLeft, 
    CheckCircle, 
    AlertTriangle, 
    FileText, 
    Calendar, 
    Building2, 
    CreditCard,
    Printer,
    Pencil,
    Download,
    Wallet
} from 'lucide-react';
import { index, post, edit } from '@/routes/accounting/bills';
import { create as createPayment } from '@/routes/accounting/vendor-payments';
import MatchStatusBadge from './components/MatchStatusBadge';
import { toast } from 'sonner';

interface MatchException {
    type: string;
    product_id?: number;
    product_name?: string;
    message: string;
}

interface Props {
    bill: {
        id: number;
        bill_number: string;
        reference_number: string;
        date: string;
        due_date: string;
        status: string;
        match_status?: string;
        match_exceptions?: MatchException[];
        vendor: {
            id: number;
            name: string;
            email: string;
            phone: string;
            address: string;
        };
        items: {
            id: number;
            product: {
                name: string;
                sku: string;
            };
            description: string;
            quantity: number;
            unit_price: number;
            total: number;
        }[];
        total_amount: number;
        subtotal: number;
        tax_amount: number;
        tax_rate: number;
        withholding_tax_amount: number;
        withholding_tax_rate: number;
        tax_inclusive: boolean;
        amount_paid: number;
        balance_due: number;
        notes: string;
        attachment_path: string | null;
        payment_lines?: {
            id: number;
            amount: number;
            payment?: {
                id: number;
                payment_number: string;
                date: string;
            };
        }[];
    };
}

export default function Show({ bill }: Props) {
    const [processing, setProcessing] = useState(false);

    const handlePost = () => {
        setProcessing(true);
        router.post(post.url(bill.id), {}, {
            onSuccess: (page) => {
                // @ts-ignore
                if (page.props.flash?.error) {
                    // @ts-ignore
                    toast.error(page.props.flash.error);
                } else {
                    toast.success('Bill posted successfully');
                }
                setProcessing(false);
            },
            onError: (errors) => {
                toast.error('Failed to post bill');
                console.error(errors);
                setProcessing(false);
            }
        });
    };

    const getStatusInfo = (status: string) => {
        const variants: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
            draft: { className: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Draft', icon: <FileText className="w-3 h-3 mr-1" /> },
            posted: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Posted', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
            partial: { className: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Partial', icon: <Wallet className="w-3 h-3 mr-1" /> },
            paid: { className: 'bg-green-100 text-green-800 border-green-200 show-icon', label: 'Paid', icon: <CreditCard className="w-3 h-3 mr-1" /> },
            cancelled: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
        };
        return variants[status] || { className: 'bg-gray-100', label: status, icon: null };
    };

    const formatCurrency = (amount: number | string) => {
        const val = Number(amount);
        if (isNaN(val)) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
    };

    const formatDate = (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const statusInfo = getStatusInfo(bill.status);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Vendor Bills', href: index.url() },
                { title: bill.bill_number, href: '#' },
            ]}
        >
            <Head title={`Bill ${bill.bill_number}`} />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" asChild>
                            <a href={`/accounting/bills/${bill.id}/print`} target="_blank" rel="noopener noreferrer">
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </a>
                        </Button>
                        {bill.status === 'draft' && (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={bill.id ? edit.url(bill.id) : '#'}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={processing}>
                                            {processing ? 'Posting...' : 'Post Bill'}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Post Vendor Bill?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will finalize the bill and create a journal entry in your accounting system.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handlePost}>
                                                Post Bill
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                        {(bill.status === 'posted' || bill.status === 'partial') && bill.balance_due > 0 && (
                            <Button asChild>
                                <Link href={`${createPayment.url()}?vendor_id=${bill.vendor.id}`}>
                                    <Wallet className="mr-2 h-4 w-4" /> Register Payment
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Main Bill Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Header Card */}
                        <Card className="border-l-4 border-l-primary">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-2xl font-bold tracking-tight">{bill.bill_number}</h1>
                                            <Badge variant="outline" className={statusInfo.className}>
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Created on {formatDate(bill.date)}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                        <p className="text-3xl font-bold text-primary">{formatCurrency(bill.total_amount)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Reference</p>
                                        <p className="font-medium">{bill.reference_number || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Due Date</p>
                                        <p className={`font-medium ${new Date(bill.due_date) < new Date() && bill.status !== 'paid' ? 'text-red-600' : ''}`}>
                                            {formatDate(bill.due_date)}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-muted-foreground">Vendor</p>
                                        <div className="font-medium flex items-center gap-2">
                                            <Building2 className="w-3 h-3 text-muted-foreground" />
                                            {bill.vendor?.name || 'Unknown Vendor'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Bill Items</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="pl-6">Product</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right pr-6">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bill.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="pl-6">
                                                    <div>
                                                        <div className="font-medium">{item.product.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.description || item.product.sku}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(item.unit_price)}</TableCell>
                                                <TableCell className="text-right font-medium font-mono pr-6">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="bg-muted/30 border-t p-6">
                                <div className="w-full flex flex-col items-end gap-2">
                                    <div className="flex justify-between w-full sm:w-1/2 md:w-1/3 text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-mono">{formatCurrency(bill.subtotal)}</span>
                                    </div>
                                    {bill.tax_amount > 0 && (
                                        <div className="flex justify-between w-full sm:w-1/2 md:w-1/3 text-sm">
                                            <span className="text-muted-foreground">PPN ({bill.tax_rate}%) {bill.tax_inclusive ? '(Incl.)' : ''}</span>
                                            <span className="font-mono">{formatCurrency(bill.tax_amount)}</span>
                                        </div>
                                    )}
                                    {bill.withholding_tax_amount > 0 && (
                                        <div className="flex justify-between w-full sm:w-1/2 md:w-1/3 text-sm text-red-600">
                                            <span className="text-muted-foreground">PPh 23 ({bill.withholding_tax_rate}%)</span>
                                            <span className="font-mono">({formatCurrency(bill.withholding_tax_amount)})</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between w-full sm:w-1/2 md:w-1/3 font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(bill.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between w-full sm:w-1/2 md:w-1/3 text-sm text-muted-foreground">
                                        <span>Paid</span>
                                        <span className="font-mono">{formatCurrency(bill.amount_paid)}</span>
                                    </div>
                                    <div className={`flex justify-between w-full sm:w-1/2 md:w-1/3 font-bold text-lg ${bill.balance_due > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        <span>Balance Due</span>
                                        <span>{formatCurrency(bill.balance_due)}</span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Payment History */}
                        {bill.payment_lines && bill.payment_lines.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment History</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="pl-6">Payment #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right pr-6">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bill.payment_lines.map((line: any) => (
                                                <TableRow key={line.id}>
                                                    <TableCell className="pl-6 font-medium">
                                                        {line.payment?.payment_number || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(line.payment?.date)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono pr-6">
                                                        {formatCurrency(line.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Match Validation Status */}
                        {bill.status === 'posted' && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                                        Matching Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MatchStatusBadge status={bill.match_status || 'pending'} exceptions={bill.match_exceptions} />
                                    
                                    {bill.match_status === 'exception' && bill.match_exceptions && (
                                        <div className="mt-4 space-y-3">
                                            {bill.match_exceptions.map((exc, idx) => (
                                                <div key={idx} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                                                    <div className="font-medium text-red-800 flex items-center gap-2 mb-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {exc.product_name || 'Exception'}
                                                    </div>
                                                    <p className="text-red-600">{exc.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Vendor Details */}
                         <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Vendor Details</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-4 text-sm">
                                <div>
                                    <div className="font-medium">{bill.vendor?.name || 'Unknown Vendor'}</div>
                                    <div className="text-muted-foreground">{bill.vendor?.address || '-'}</div>
                                </div>
                                <Separator />
                                <div className="grid gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium">{bill.vendor?.email || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phone</span>
                                        <span className="font-medium">{bill.vendor?.phone || '-'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {bill.notes && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bill.notes}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Attachments */}
                        {bill.attachment_path && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        Attachment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a 
                                        href={`/storage/${bill.attachment_path}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="bg-primary/10 p-2 rounded text-primary group-hover:bg-primary/20">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">Invoice Document</p>
                                            <p className="text-xs text-muted-foreground">Click to view</p>
                                        </div>
                                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                    </a>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
