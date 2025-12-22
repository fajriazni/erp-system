import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, FileSignature, DollarSign } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { show } from '@/routes/purchasing/orders';

interface Props {
    data: {
        contract_compliance_rate: number;
        maverick_spend: number;
        active_contracts: number;
        expiring_soon: number;
        details: Array<{
            id: number;
            document_number: string;
            date: string;
            total: number | string;
            vendor_name: string;
        }>;
    };
    currency: string;
}

export default function Compliance({ data, currency }: Props) {
    const formatCurrency = (val: number | string) => {
        const numVal = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(numVal);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Analytics', href: '/purchasing/analytics/compliance' },
            { title: 'Contract Compliance' }
        ]}>
            <Head title="Contract Compliance" />
            <div className="container mx-auto space-y-6">
                <PageHeader title="Contract Compliance" description="Monitoring adherence to purchasing agreements and avoiding maverick buying." />

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.contract_compliance_rate}%</div>
                             <Progress value={data.contract_compliance_rate} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                % of PO spend against active contracts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Maverick Spend</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{formatCurrency(data.maverick_spend)}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Spend outside of established contracts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                            <FileSignature className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.active_contracts}</div>
                        </CardContent>
                    </Card>
                    
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                            <ClockIcon className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">{data.expiring_soon}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Contracts expiring in 30 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {data.expiring_soon > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Attention Required</AlertTitle>
                        <AlertDescription>
                            You have {data.expiring_soon} contracts expiring within 30 days. Review them in the Contracts module to renew or renegotiate.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Maverick Spend Transactions (Off-Contract)</CardTitle>
                        <CardDescription>Recent purchase orders from vendors without active contracts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.details && data.details.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PO Number</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.details.map((po) => (
                                        <TableRow key={po.id}>
                                            <TableCell className="font-medium">{po.document_number}</TableCell>
                                            <TableCell>{po.vendor_name}</TableCell>
                                            <TableCell>{po.date}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(po.total)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={show(po.id).url}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <ShieldCheck className="h-12 w-12 text-green-500 mb-2" />
                                <p>Excellent! No maverick transactions found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function ClockIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
}
