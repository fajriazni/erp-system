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
import { ClipboardCheck, ArrowRight } from 'lucide-react';

interface GoodsReceiptItem {
  id: number;
  product: { name: string; sku: string };
  goods_receipt: { receipt_number: string };
  quantity_received: number;
  uom: { code: string };
  qc_status: string;
}

interface PageProps {
  pending_qc: {
    data: GoodsReceiptItem[];
    links: any[];
  };
}

export default function InboundQc({ pending_qc }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Quality Control', href: '#' }]}>
      <Head title="Quality Inspection" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Quality Inspection Queue</h2>
         </div>

         <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Pending Inspections</CardTitle>
            </CardHeader>
            <CardContent>
                {pending_qc.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ClipboardCheck className="h-12 w-12 mb-4 opacity-50" />
                        <p>No items pending inspection</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Receipt #</TableHead>
                                <TableHead>Qty Received</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pending_qc.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.product?.name}
                                        <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                                    </TableCell>
                                    <TableCell>{item.goods_receipt?.receipt_number}</TableCell>
                                    <TableCell>{item.quantity_received} {item.uom?.code}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.qc_status === 'passed' ? 'default' : 'secondary'}>
                                            {item.qc_status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" asChild>
                                            <Link href={`/inventory/inbound/qc/${item.id}/inspect`}>
                                                Inspect
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
