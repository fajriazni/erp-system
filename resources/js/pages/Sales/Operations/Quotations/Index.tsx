import { Head, Link } from '@inertiajs/react';
import * as Quotations from '@/actions/App/Http/Controllers/Sales/Operations/QuotationController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MoreHorizontal, FileText } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Quotation {
    id: number;
    document_number: string;
    date: string;
    customer: { name: string; company_name?: string };
    total: number;
    status: string;
}

interface Props {
    quotations: {
        data: Quotation[];
        links: any[];
    };
}

export default function QuotationsIndex({ quotations }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Quotations', href: '#' }]}>
            <Head title="Quotations" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quotations</h2>
                        <p className="text-muted-foreground">Manage sales quotations and estimates.</p>
                    </div>
                    <Button asChild>
                        <Link href={Quotations.create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> New Quotation
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="p-0" />
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotations.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No quotations found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    quotations.data.map((quote) => (
                                        <TableRow key={quote.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                {quote.document_number}
                                            </TableCell>
                                            <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{quote.customer?.company_name || quote.customer?.name}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(quote.total)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {quote.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View</DropdownMenuItem>
                                                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-blue-600">Convert to Order</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
