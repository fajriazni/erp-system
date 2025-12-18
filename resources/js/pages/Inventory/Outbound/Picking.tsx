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
import { ScanBarcode, ArrowRight } from 'lucide-react';

interface Delivery {
  id: number;
  delivery_number: string;
  date: string;
  status: string;
  sales_order?: { document_number: string; customer?: { company_name: string } };
}

interface PageProps {
  picking_list: {
    data: Delivery[];
    links: any[];
  };
}

export default function Picking({ picking_list }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Picking Operations', href: '#' }]}>
      <Head title="Picking Operations" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Picking List</h2>
        </div>

         <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Ready to Pick</CardTitle>
            </CardHeader>
            <CardContent>
                {picking_list.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ScanBarcode className="h-12 w-12 mb-4 opacity-50" />
                        <p>No orders ready for picking</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Delivery #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Sales Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {picking_list.data.map((doItem) => (
                                <TableRow key={doItem.id}>
                                    <TableCell className="font-medium">{doItem.delivery_number}</TableCell>
                                    <TableCell>{new Date(doItem.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{doItem.sales_order?.document_number || '-'}</TableCell>
                                    <TableCell>{doItem.sales_order?.customer?.company_name || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{doItem.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" asChild>
                                            <Link href={`/inventory/outbound/picking/${doItem.id}/process`}>Pick Items</Link>
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
