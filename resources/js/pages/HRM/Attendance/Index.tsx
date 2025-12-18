import { Head, useForm, router } from '@inertiajs/react';
import * as Attendance from '@/actions/App/Http/Controllers/HRM/AttendanceController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Props {
    attendances: { data: any[]; links: any[] };
    filters: any;
}

export default function AttendanceIndex({ attendances, filters }: Props) {
    const [date, setDate] = useState<Date | undefined>(filters.date ? new Date(filters.date) : new Date());

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: '1', // Hardcoded for demo/simulation
        type: 'clock_in',
        time: format(new Date(), 'HH:mm'),
        date: format(new Date(), 'yyyy-MM-dd'),
    });

    const handleFilterDate = (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            router.get(Attendance.index.url(), { date: format(newDate, 'yyyy-MM-dd') }, { preserveState: true });
        }
    };

    const handleClock = (type: 'clock_in' | 'clock_out') => {
        setData('type', type);
        // data.type is updated asynchronously, so better to just use setData and then submit manually if needed
        // But Inertia useForm is reactive.
        // Let's just create a separate request for clocking, or update state then post.
        // Actually, the simplest way is to NOT use useForm for this if we want immediate custom data.
        // But keeping it simple:
        
        router.post(Attendance.store.url(), {
            employee_id: '1',
            type,
            time: format(new Date(), 'HH:mm'),
            date: format(new Date(), 'yyyy-MM-dd'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Attendance', href: '#' }]}>
            <Head title="Attendance" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Daily Attendance</h2>
                        <p className="text-muted-foreground">Monitor employee check-ins and check-outs.</p>
                    </div>
                    <div className="flex gap-2">
                         <div className="flex items-center gap-2">
                             {/* Simulation Controls using ID 1 (Assumed Admin/Self) */}
                            <Button onClick={() => handleClock('clock_in')} disabled={processing} className="bg-green-600 hover:bg-green-700">
                                <LogIn className="mr-2 h-4 w-4" /> Clock In
                            </Button>
                            <Button onClick={() => handleClock('clock_out')} disabled={processing} variant="secondary">
                                <LogOut className="mr-2 h-4 w-4" /> Clock Out
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{attendances.data.filter(a => a.status === 'present').length}</div>
                            <p className="text-xs text-muted-foreground">Employees clocked in</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Attendance Log</CardTitle>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                         <div className="p-4 bg-white rounded-md border shadow-md">
                                            <input 
                                                type="date" 
                                                className="border rounded px-2 py-1"
                                                value={date ? format(date, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => handleFilterDate(e.target.value ? new Date(e.target.value) : undefined)}
                                            />
                                         </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendances.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No attendance records for this date.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    attendances.data.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">
                                                {record.employee?.first_name} {record.employee?.last_name}
                                            </TableCell>
                                            <TableCell>{record.date}</TableCell>
                                            <TableCell>{record.clock_in ? record.clock_in : '-'}</TableCell>
                                            <TableCell>{record.clock_out ? record.clock_out : '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{record.notes || '-'}</TableCell>
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
