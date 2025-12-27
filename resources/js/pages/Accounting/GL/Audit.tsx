import { Head } from '@inertiajs/react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

interface JournalLine {
  id: number;
  debit: string;
  credit: string;
  chart_of_account?: { code: string; name: string };
  journal_entry?: { reference_number: string; date: string; description: string };
}

interface PageProps {
  lines: {
    data: JournalLine[];
  };
}

export default function Audit({ lines }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Audit Trail', href: '#' }]}>
      <Head title="Audit Trail" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">GL Audit Trail</h2>
         <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                {lines.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <History className="h-12 w-12 mb-4 opacity-50" />
                        <p>No transactions found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.data.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.journal_entry ? new Date(line.journal_entry.date).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell className="font-medium">{line.journal_entry?.reference_number}</TableCell>
                                    <TableCell>
                                        <div className="w-full">
                                            <span className="font-bold">{line.chart_of_account?.code}</span>
                                            <span className="text-xs text-muted-foreground">{line.chart_of_account?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{parseFloat(line.debit) > 0 ? parseFloat(line.debit).toFixed(2) : '-'}</TableCell>
                                    <TableCell className="text-right">{parseFloat(line.credit) > 0 ? parseFloat(line.credit).toFixed(2) : '-'}</TableCell>
                                    <TableCell className="text-xs max-w-xs truncate" title={line.journal_entry?.description}>{line.journal_entry?.description}</TableCell>
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
