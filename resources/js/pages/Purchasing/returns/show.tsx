import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { index } from '@/routes/purchasing/returns';
import { useCurrency } from '@/hooks/use-currency';
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
  } from "@/components/ui/alert-dialog"

interface Props {
    return: {
        id: number;
        document_number: string;
        date: string;
        status: string;
        amount: number;
        notes: string;
        rma_number?: string;
        vendor: { name: string; email: string };
        warehouse: { name: string };
        lines: {
            id: number;
            product: { name: string; code: string };
            quantity: number;
            unit_price: number;
            total: number;
        }[];
        debitNote?: {
            id: number;
            debit_note_number: string;
            total_amount: number;
            status: string;
        } | null;
    };
}

export default function Show({ return: returnData }: Props) {
    const handlePost = () => {
        router.post(`/purchasing/returns/${returnData.id}/post`);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Returns', href: index.url() },
            { title: returnData.document_number }
        ]}>
            <Head title={`Return ${returnData.document_number}`} />
            <div className="container mx-auto">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={index.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{returnData.document_number}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={returnData.status === 'posted' ? 'default' : 'secondary'} className="capitalize">
                                {returnData.status}
                            </Badge>
                            <span className="text-muted-foreground">
                                • {new Date(returnData.date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {returnData.status === 'draft' && (
                            <>
                                <Link href={`/purchasing/returns/${returnData.id}/edit`}>
                                    <Button variant="outline">Edit</Button>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button>Authorize Return</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Authorize Return</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Enter RMA number to authorize this return for shipment.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="py-4">
                                            <Input
                                                id="rma_number"
                                                placeholder="RMA-2025-0001"
                                                defaultValue={`RMA-${new Date().getFullYear()}-${String(returnData.id).padStart(4, '0')}`}
                                            />
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => {
                                                const rmaNumber = (document.getElementById('rma_number') as HTMLInputElement)?.value;
                                                router.post(`/purchasing/returns/${returnData.id}/authorize`, { rma_number: rmaNumber });
                                            }}>
                                                Authorize
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                        
                        {returnData.status === 'ready_to_ship' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>Ship Return</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Ship Return?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Mark this return as shipped to vendor. Inventory will be adjusted.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => router.post(`/purchasing/returns/${returnData.id}/ship`)}>
                                            Ship
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        
                        {returnData.status === 'shipped' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>Mark as Received</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Receipt by Vendor?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will mark the return as received by vendor and automatically create a debit note.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => router.post(`/purchasing/returns/${returnData.id}/receive`)}>
                                            Confirm Receipt
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        
                        {returnData.status === 'received_by_vendor' && (
                            <Button onClick={() => router.post(`/purchasing/returns/${returnData.id}/complete`)}>
                                Complete Return
                            </Button>
                        )}
                        
                        {['draft', 'ready_to_ship'].includes(returnData.status) && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Cancel</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Return?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will cancel the return. Please provide a reason.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-4">
                                        <Input
                                            id="cancel_reason"
                                            placeholder="Cancellation reason"
                                        />
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Back</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                            const reason = (document.getElementById('cancel_reason') as HTMLInputElement)?.value;
                                            router.post(`/purchasing/returns/${returnData.id}/cancel`, { reason });
                                        }}>
                                            Cancel Return
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Vendor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{returnData.vendor.name}</div>
                            <div className="text-sm text-muted-foreground">{returnData.vendor.email}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Reference</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{returnData.document_number}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {useCurrency().format(returnData.amount)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Unit Price</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returnData.lines.map((line) => (
                                    <tr key={line.id} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2">
                                            <div className="font-medium">{line.product.name}</div>
                                            <div className="text-xs text-gray-500">{line.product.code}</div>
                                        </td>
                                        <td className="px-4 py-2 text-right">{line.quantity}</td>
                                        <td className="px-4 py-2 text-right">
                                            {useCurrency().format(line.unit_price)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium">
                                            {useCurrency().format(line.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {returnData.notes && (
                            <div className="mt-6">
                                <h4 className="font-medium mb-2">Notes</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{returnData.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {returnData.debitNote && (
                    <Card className="border-green-200 bg-green-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Related Debit Note</span>
                                <Badge variant="default" className="bg-green-600">
                                    {returnData.debitNote.status}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                A debit note was automatically created when this return was received by vendor
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Debit Note Number</div>
                                    <div className="text-lg font-semibold">{returnData.debitNote.debit_note_number}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Amount</div>
                                    <div className="text-lg font-semibold text-green-600">
                                        {useCurrency().format(returnData.debitNote.total_amount)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link href={`/purchasing/debit-notes/${returnData.debitNote.id}`}>
                                    <Button variant="outline" className="w-full">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Debit Note Details
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
