import { Head, Link, useForm } from '@inertiajs/react';
import * as Payroll from '@/actions/App/Http/Controllers/HRM/PayrollController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';

interface Props {
    runs: { data: any[] };
}

export default function PayrollIndex({ runs }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Payroll', href: '#' }]}>
            <Head title="Payroll" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Payroll Runs</h2>
                        <p className="text-muted-foreground">Manage salary processing periods.</p>
                    </div>
                    <Button asChild>
                        <Link href={Payroll.create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> Run Payroll
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Pay Date</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {runs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No payroll runs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    runs.data.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell>
                                                {new Date(run.period_start).toLocaleDateString()} - {new Date(run.period_end).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{new Date(run.pay_date).toLocaleDateString()}</TableCell>
                                            <TableCell>${Number(run.total_amount).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={run.status === 'paid' ? 'default' : 'secondary'}>
                                                    {run.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={Payroll.show.url(run.id)}>
                                                        <Eye className="w-4 h-4" />
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
