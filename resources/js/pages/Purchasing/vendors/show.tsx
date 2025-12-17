import { index as receiptsIndex } from '@/routes/purchasing/receipts';
import { index as ordersIndex } from '@/routes/purchasing/orders';

import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import VendorScorecard from './components/VendorScorecard';
import { index, edit } from '@/routes/purchasing/vendors';

interface Props {
    vendor: any;
}

export default function VendorShow({ vendor }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendors', href: '/purchasing/vendors' },
            { title: vendor.name, href: '#' }
        ]}>
            <Head title={`Vendor: ${vendor.name}`} />

            <div className="max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={edit.url(vendor.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Vendor
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Scorecard */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                                    <div>{vendor.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                                    <div>{vendor.email || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                    <div>{vendor.phone || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Address</div>
                                    <div className="whitespace-pre-wrap">{vendor.address || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Tax ID</div>
                                    <div>{vendor.tax_id || '-'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <VendorScorecard vendor={vendor} />
                    </div>

                    {/* Transaction History Placeholder */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Last 5 purchase orders</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Transaction history will be displayed here.</p>
                                    <Button variant="link" asChild className="mt-2">
                                        <Link href={ordersIndex.url({ query: { 'filter[vendor_id]': vendor.id } })}>
                                            View All Orders
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Receipts</CardTitle>
                                <CardDescription>Last 5 goods receipts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Receipt history will be displayed here.</p>
                                    <Button variant="link" asChild className="mt-2">
                                        <Link href={receiptsIndex.url({ query: { 'filter[vendor_id]': vendor.id } })}>
                                            View All Receipts
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
