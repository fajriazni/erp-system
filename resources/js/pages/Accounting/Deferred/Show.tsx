import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import { ChevronLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
    schedule: any;
    flash: { success?: string; error?: string };
}

export default function DeferredShow({ schedule }: Props) {
    const handleProcess = (itemId: number) => {
        if (confirm('Are you sure you want to process this amortization entry? This will create a posted Journal Entry.')) {
            router.post(`/accounting/deferred/items/${itemId}/process`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Deferred', href: '/accounting/deferred' }, { title: schedule.code, href: '#' }]}>
            <Head title={`Schedule ${schedule.code}`} />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/accounting/deferred">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">{schedule.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <span>{schedule.code}</span>
                            <span>•</span>
                            <Badge variant="outline">{schedule.type}</Badge>
                            <span>•</span>
                            <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>{schedule.status}</Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Amortization Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Journal Entry</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedule.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {format(new Date(item.date), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {item.is_processed ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Processed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.journal_entry ? (
                                                     <Link href={`/accounting/journal-entries/${item.journal_entry.id}`} className="flex items-center text-blue-600 hover:underline">
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        {item.journal_entry.reference_number}
                                                     </Link>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!item.is_processed && (
                                                    <Button size="sm" onClick={() => handleProcess(item.id)}>
                                                        Process
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Total Amount</div>
                                    <div className="text-xl font-bold">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(schedule.total_amount)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Period</div>
                                    <div className="font-medium">
                                        {format(new Date(schedule.start_date), 'd MMM yyyy')} - {format(new Date(schedule.end_date), 'd MMM yyyy')}
                                    </div>
                                </div>
                                <div className="pt-4 border-t space-y-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Deferred Account</div>
                                        <div className="font-medium">{schedule.deferred_account?.code} - {schedule.deferred_account?.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Recognition Account</div>
                                        <div className="font-medium">{schedule.recognition_account?.code} - {schedule.recognition_account?.name}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
