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
import { Truck } from 'lucide-react';

interface Delivery {
  id: number;
  delivery_number: string;
  date: string;
  status: string;
  sales_order?: { document_number: string };
}

interface PageProps {
  shipments: {
    data: Delivery[];
  };
}

export default function Shipping({ shipments }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Shipping', href: '#' }]}>
      <Head title="Shipping Operations" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Shipping Queue</h2>
         <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Ready to Ship</CardTitle>
            </CardHeader>
            <CardContent>
                {shipments.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Truck className="h-12 w-12 mb-4 opacity-50" />
                        <p>No shipments pending</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Delivery #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shipments.data.map((doItem) => (
                                <TableRow key={doItem.id}>
                                    <TableCell className="font-medium">{doItem.delivery_number}</TableCell>
                                    <TableCell>{new Date(doItem.date).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge>{doItem.status}</Badge></TableCell>
                                    <TableCell className="text-right"><Button size="sm">Ship</Button></TableCell>
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
