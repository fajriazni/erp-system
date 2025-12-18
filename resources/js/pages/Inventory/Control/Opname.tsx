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
import { ClipboardCheck } from 'lucide-react';

interface Count {
  id: number;
  date: string;
  status: string;
  warehouse?: { name: string };
  description?: string;
}

interface PageProps {
  counts: {
    data: Count[];
  };
}

export default function Opname({ counts }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }, { title: 'Stock Opname', href: '#' }]}>
      <Head title="Stock Opname" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Stock Opname (Physical Count)</h2>
            <Button>New Opname</Button>
        </div>

         <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Opname History</CardTitle>
            </CardHeader>
            <CardContent>
                {counts.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ClipboardCheck className="h-12 w-12 mb-4 opacity-50" />
                        <p>No opname records found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {counts.data.map((count) => (
                                <TableRow key={count.id}>
                                    <TableCell>{new Date(count.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{count.warehouse?.name}</TableCell>
                                    <TableCell>{count.description || '-'}</TableCell>
                                    <TableCell><Badge variant="outline">{count.status}</Badge></TableCell>
                                    <TableCell className="text-right"><Button size="sm">Resumé</Button></TableCell>
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
