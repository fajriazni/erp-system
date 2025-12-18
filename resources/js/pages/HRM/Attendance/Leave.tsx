import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Props {
    leaves: { data: any[] };
}

export default function LeaveIndex({ leaves }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Leave Requests', href: '#' }]}>
            <Head title="Leave Requests" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Leave Requests</h2>
                        <p className="text-muted-foreground">Manage employee leave applications.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaves.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No pending leave requests.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaves.data.map((leave) => (
                                        <TableRow key={leave.id}>
                                            <TableCell>{leave.employee?.first_name} {leave.employee?.last_name}</TableCell>
                                            <TableCell className="capitalize">{leave.leave_type}</TableCell>
                                            <TableCell>{leave.start_date}</TableCell>
                                            <TableCell>{leave.end_date}</TableCell>
                                            <TableCell>{leave.reason}</TableCell>
                                            <TableCell>
                                                <Badge variant={leave.status === 'approved' ? 'default' : 'secondary'}>
                                                    {leave.status}
                                                </Badge>
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
