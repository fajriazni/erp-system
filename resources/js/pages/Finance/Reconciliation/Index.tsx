
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { Plus, Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const formatMoney = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
};

export default function ReconciliationIndex({ reconciliations, accounts }: any) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Bank Reconciliation', href: '#' }
        ]}>
            <Head title="Bank Reconciliation" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
                        <p className="text-muted-foreground mt-1">
                            Verify your system records against bank statements.
                        </p>
                    </div>
                    
                    <Button asChild>
                        <Link href={route('finance.reconciliation.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Reconciliation
                        </Link>
                    </Button>
                </div>

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reconciled this Month</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground mt-1">Sessions completed</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Drafts</CardTitle>
                            <Scale className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reconciliations.data.filter((r: any) => r.status === 'draft').length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">In progress</p>
                        </CardContent>
                    </Card>
                </div>

                {/* List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reconciliation History</CardTitle>
                        <CardDescription>
                            Recent reconciliation sessions and their status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Statement Date</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Statement Bal.</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reconciliations.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No reconciliation history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reconciliations.data.map((rec: any) => (
                                        <TableRow key={rec.id}>
                                            <TableCell className="font-medium">
                                                {rec.bank_account.name}
                                                <div className="text-xs text-muted-foreground">{rec.bank_account.bank_name}</div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(rec.statement_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(rec.start_date).toLocaleDateString()} - {new Date(rec.end_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatMoney(Number(rec.statement_balance), rec.bank_account.currency)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={rec.status === 'reconciled' ? 'success' : 'secondary'}>
                                                    {rec.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('finance.reconciliation.show', rec.id)}>
                                                        {rec.status === 'draft' ? 'Resume' : 'View'}
                                                    </Link>
                                                </Button>
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
