import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Lock, Unlock, Calendar, AlertCircle, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AccountingPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'open' | 'locked';
    locked_at?: string;
    locked_by?: {
        id: number;
        name: string;
    };
    lock_notes?: string;
}

interface Props {
    periods: {
        data: AccountingPeriod[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    filters?: {
        status?: string;
        year?: number;
    };
    availableYears: number[];
}

export default function AccountingPeriodsIndex({ periods, filters, availableYears }: Props) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
    const [lockDialogOpen, setLockDialogOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | null>(null);

    const filterForm = useForm({
        status: filters?.status || 'all',
        year: filters?.year || new Date().getFullYear(),
    });

    const createForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
    });

    const lockForm = useForm({
        notes: '',
    });

    const editForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
    });

    const handleFilter = () => {
        const params: any = {};
        
        // Only send status if not 'all'
        if (filterForm.data.status && filterForm.data.status !== 'all') {
            params.status = filterForm.data.status;
        }
        
        // Only send year if specified
        if (filterForm.data.year) {
            params.year = filterForm.data.year;
        }
        
        router.get('/accounting/periods', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/accounting/periods', {
            onSuccess: () => {
                setCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const handleLock = (period: AccountingPeriod) => {
        setSelectedPeriod(period);
        setLockDialogOpen(true);
    };

    const confirmLock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPeriod) return;

        lockForm.post(`/accounting/periods/${selectedPeriod.id}/lock`, {
            onSuccess: () => {
                setLockDialogOpen(false);
                setSelectedPeriod(null);
                lockForm.reset();
            },
        });
    };

    const handleUnlockClick = (period: AccountingPeriod) => {
        setSelectedPeriod(period);
        setUnlockDialogOpen(true);
    };

    const handleUnlock = () => {
        if (!selectedPeriod) return;

        router.post(`/accounting/periods/${selectedPeriod.id}/unlock`, {}, {
            onSuccess: () => {
                setUnlockDialogOpen(false);
                setSelectedPeriod(null);
            },
        });
    };

    const handleEdit = (period: AccountingPeriod) => {
        setSelectedPeriod(period);
        
        // Format dates to YYYY-MM-DD for input[type="date"]
        const formatDateForInput = (dateString: string) => {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };
        
        editForm.setData({
            name: period.name,
            start_date: formatDateForInput(period.start_date),
            end_date: formatDateForInput(period.end_date),
        });
        setEditDialogOpen(true);
    };

    const confirmEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPeriod) return;

        editForm.patch(`/accounting/periods/${selectedPeriod.id}`, {
            onSuccess: () => {
                setEditDialogOpen(false);
                setSelectedPeriod(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteClick = (period: AccountingPeriod) => {
        setSelectedPeriod(period);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!selectedPeriod) return;

        router.delete(`/accounting/periods/${selectedPeriod.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedPeriod(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === 'locked') {
            return <Badge variant="destructive" className="gap-1"><Lock className="h-3 w-3" /> Locked</Badge>;
        }
        return <Badge variant="default" className="gap-1">Open</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Accounting', href: '/accounting' },
            { title: 'Closing', href: '/accounting/closing' },
            { title: 'Periods', href: '#' }
        ]}>
            <Head title="Accounting Periods" />

            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Accounting Periods"
                    description="Manage accounting periods and prevent editing of closed periods."
                >
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Period
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleCreate}>
                                <DialogHeader>
                                    <DialogTitle>Create Accounting Period</DialogTitle>
                                    <DialogDescription>
                                        Create a new accounting period to track transactions.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div>
                                        <Label htmlFor="name">Period Name</Label>
                                        <Input
                                            id="name"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            placeholder="e.g., 2025-01 or January 2025"
                                            required
                                        />
                                        {createForm.errors.name && (
                                            <p className="text-sm text-destructive mt-1">{createForm.errors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={createForm.data.start_date}
                                            onChange={(e) => createForm.setData('start_date', e.target.value)}
                                            required
                                        />
                                        {createForm.errors.start_date && (
                                            <p className="text-sm text-destructive mt-1">{createForm.errors.start_date}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={createForm.data.end_date}
                                            onChange={(e) => createForm.setData('end_date', e.target.value)}
                                            required
                                        />
                                        {createForm.errors.end_date && (
                                            <p className="text-sm text-destructive mt-1">{createForm.errors.end_date}</p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing}>
                                        {createForm.processing ? 'Creating...' : 'Create Period'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </PageHeader>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Locked periods prevent editing of journal entries. Only users with unlock permission can reopen locked periods.
                    </AlertDescription>
                </Alert>

                <Card className="p-0 gap-0">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between gap-4">
                            <Tabs 
                                value={filters?.status || 'all'} 
                                onValueChange={(value) => {
                                    router.get('/accounting/periods', {
                                        ...(value !== 'all' && { status: value }),
                                        ...(filterForm.data.year && { year: filterForm.data.year }),
                                    }, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                <TabsList>
                                    <TabsTrigger value="all">All Periods</TabsTrigger>
                                    <TabsTrigger value="open">Open</TabsTrigger>
                                    <TabsTrigger value="locked">Locked</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-2">
                                <Label htmlFor="year" className="text-sm font-medium">Year</Label>
                                <Select
                                    value={filterForm.data.year?.toString()}
                                    onValueChange={(value) => {
                                        filterForm.setData('year', parseInt(value));
                                        setTimeout(handleFilter, 0);
                                    }}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period Name</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Locked By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periods.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No accounting periods found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                periods.data.map((period) => (
                                    <TableRow key={period.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {period.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(period.start_date), 'PP')}</TableCell>
                                        <TableCell>{format(new Date(period.end_date), 'PP')}</TableCell>
                                        <TableCell>{getStatusBadge(period.status)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {period.locked_by ? (
                                                <div>
                                                    <div>{period.locked_by.name}</div>
                                                    {period.locked_at && (
                                                        <div className="text-xs">
                                                            {format(new Date(period.locked_at), 'PPp')}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuItem onClick={() => handleEdit(period)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Period
                                                    </DropdownMenuItem>
                                                    {period.status === 'open' ? (
                                                        <DropdownMenuItem onClick={() => handleLock(period)}>
                                                            <Lock className="mr-2 h-4 w-4" /> Lock Period
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleUnlockClick(period)}>
                                                            <Unlock className="mr-2 h-4 w-4" /> Unlock Period
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDeleteClick(period)}
                                                        disabled={period.status === 'locked'}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Period
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <DataTablePagination
                        links={periods.links}
                        from={periods.from}
                        to={periods.to}
                        total={periods.total}
                        per_page={periods.per_page}
                        onPerPageChange={() => {}}
                        onPageChange={(url) => {
                            if (url) router.get(url);
                        }}
                    />
                </Card>
            </div>

            {/* Lock Period Dialog */}
            <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
                <DialogContent>
                    <form onSubmit={confirmLock}>
                        <DialogHeader>
                            <DialogTitle>Lock Period {selectedPeriod?.name}</DialogTitle>
                            <DialogDescription>
                                This will prevent any edits to journal entries within this period. You can unlock it later if needed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={lockForm.data.notes}
                                    onChange={(e) => lockForm.setData('notes', e.target.value)}
                                    placeholder="Reason for locking this period..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setLockDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={lockForm.processing}>
                                {lockForm.processing ? 'Locking...' : 'Lock Period'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Unlock Period Confirmation Dialog */}
            <AlertDialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unlock Period {selectedPeriod?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will allow editing of journal entries in this period. Are you sure you want to unlock this period?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlock}>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock Period
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Period Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <form onSubmit={confirmEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Period {selectedPeriod?.name}</DialogTitle>
                            <DialogDescription>
                                Update the accounting period details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Period Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    placeholder="e.g., January 2025"
                                    required
                                />
                                {editForm.errors.name && (
                                    <span className="text-sm text-red-500">{editForm.errors.name}</span>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-start-date">Start Date</Label>
                                <Input
                                    id="edit-start-date"
                                    type="date"
                                    value={editForm.data.start_date}
                                    onChange={(e) => editForm.setData('start_date', e.target.value)}
                                    required
                                />
                                {editForm.errors.start_date && (
                                    <span className="text-sm text-red-500">{editForm.errors.start_date}</span>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-end-date">End Date</Label>
                                <Input
                                    id="edit-end-date"
                                    type="date"
                                    value={editForm.data.end_date}
                                    onChange={(e) => editForm.setData('end_date', e.target.value)}
                                    required
                                />
                                {editForm.errors.end_date && (
                                    <span className="text-sm text-red-500">{editForm.errors.end_date}</span>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Period Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Period {selectedPeriod?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the accounting period.
                            {selectedPeriod?.status === 'locked' && (
                                <span className="block mt-2 text-red-500 font-semibold">
                                    This period is locked and cannot be deleted. Unlock it first.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Period
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
