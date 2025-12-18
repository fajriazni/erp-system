import { Head, Link } from '@inertiajs/react';
import * as Payroll from '@/actions/App/Http/Controllers/HRM/PayrollController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
    payroll: {
        id: number;
        period_start: string;
        period_end: string;
        pay_date: string;
        status: string;
        total_amount: number;
        payslips: any[];
    };
}

export default function PayrollShow({ payroll }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Payroll', href: Payroll.index.url() }, { title: `run-${payroll.id}`, href: '#' }]}>
            <Head title="Payroll Details" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Payroll Run Details</h2>
                        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                            <span>Period: {new Date(payroll.period_start).toLocaleDateString()} - {new Date(payroll.period_end).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Button variant="outline">Print Summary</Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-bold">${Number(payroll.total_amount).toLocaleString()}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium">Headcount</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-bold">{payroll.payslips.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Badge variant={payroll.status === 'paid' ? 'default' : 'secondary'}>{payroll.status.toUpperCase()}</Badge>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payslips</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Basic</TableHead>
                                    <TableHead>Allowances</TableHead>
                                    <TableHead>Deductions</TableHead>
                                    <TableHead className="text-right">Net Pay</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payroll.payslips.map((slip) => (
                                    <TableRow key={slip.id}>
                                         <TableCell>{slip.employee?.first_name} {slip.employee?.last_name}</TableCell>
                                         <TableCell>${Number(slip.basic_salary).toLocaleString()}</TableCell>
                                         <TableCell>-</TableCell>
                                         <TableCell className="text-red-500">-${Number(slip.total_deductions).toLocaleString()}</TableCell>
                                         <TableCell className="text-right font-medium">${Number(slip.net_salary).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
