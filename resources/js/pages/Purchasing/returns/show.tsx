import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { index } from '@/routes/purchasing/returns';
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
        vendor: { name: string; email: string };
        lines: {
            id: number;
            product: { name: string; code: string };
            quantity: number;
            unit_price: number;
            total: number;
        }[];
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
                    <div>
                        {returnData.status === 'draft' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Post Return
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Post Purchase Return?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will post the return, reducing inventory for the selected warehouse and creating a debit note journal entry. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handlePost}>Post Return</AlertDialogAction>
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
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(returnData.amount)}
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
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(line.unit_price)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(line.total)}
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
            </div>
        </AppLayout>
    );
}
