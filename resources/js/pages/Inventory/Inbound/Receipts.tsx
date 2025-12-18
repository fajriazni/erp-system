import { Head, Link, usePage } from '@inertiajs/react';
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
import { PackageCheck, ArrowRight } from 'lucide-react';

interface Receipt {
  id: number;
  receipt_number: string;
  date: string;
  status: string;
  warehouse?: { name: string };
  purchase_order?: { document_number: string; vendor?: { company_name: string } };
}

interface PageProps {
  receipts: {
    data: Receipt[];
    links: any[];
  };
}

export default function InboundReceipts({ receipts }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Inbound Receipts', href: '#' }]}>
      <Head title="Inbound Receipts" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-semibold tracking-tight">Goods Receipts (GR)</h2>
           <Button>Create Receipt</Button>
        </div>

        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Inbound Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {receipts.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <PackageCheck className="h-12 w-12 mb-4 opacity-50" />
                    <p>No receipts found</p>
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Source Doc</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {receipts.data.map((receipt) => (
                    <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                        <TableCell>{new Date(receipt.date).toLocaleDateString()}</TableCell>
                        <TableCell>{receipt.purchase_order?.document_number || '-'}</TableCell>
                        <TableCell>{receipt.purchase_order?.vendor?.company_name || '-'}</TableCell>
                        <TableCell>{receipt.warehouse?.name}</TableCell>
                        <TableCell>
                            <Badge variant={receipt.status === 'posted' ? 'default' : 'secondary'}>
                                {receipt.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/purchasing/receipts/${receipt.id}`}>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
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
