import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Plus } from 'lucide-react';

interface Invoice {
  id: number;
  invoice_number: string;
  date: string;
  due_date: string;
  status: string;
  total_amount: string;
  customer?: { company_name?: string; name: string };
}

interface PageProps {
  invoices: {
    data: Invoice[];
    links: any[];
  };
}

export default function Invoices({ invoices }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Invoices', href: '#' }]}>
      <Head title="Customer Invoices" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-semibold tracking-tight">Customer Invoices</h2>
           <Button asChild>
                <Link href="/accounting/ar/invoices/create">
                    <Plus className="mr-2 h-4 w-4" /> New Invoice
                </Link>
           </Button>
        </div>

        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Invoice List</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Receipt className="h-12 w-12 mb-4 opacity-50" />
                    <p>No invoices found</p>
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.data.map((inv) => (
                    <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                        <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                        <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{inv.customer?.company_name || inv.customer?.name}</TableCell>
                        <TableCell className="text-right">{parseFloat(inv.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                            <Badge variant={inv.status === 'paid' ? 'default' : (inv.status === 'posted' ? 'secondary' : 'outline')}>
                                {inv.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`#`}>View</Link>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
