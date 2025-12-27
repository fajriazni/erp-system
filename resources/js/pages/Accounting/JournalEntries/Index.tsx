import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Plus, Search, ChevronRight, FileText, Calendar, MoreHorizontal, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
    id: number;
    reference_number: string;
    date: string;
    description: string;
    status: 'draft' | 'posted';
    lines_count: number;
    total_amount: number; // If available, otherwise we can just show lines count
}

interface Props {
    entries: {
        data: JournalEntry[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    filterOptions?: {
        statuses: string[];
    };
    filters?: {
        filter?: {
            global?: string;
            status?: string;
        };
    };
}

export default function JournalEntriesIndex({ entries, filterOptions, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        filter: {
            global: filters?.filter?.global || '',
            status: filters?.filter?.status || '',
        },
        per_page: entries.per_page || 15,
    });

    const handleClearFilters = () => {
        setData('filter', {
            global: '',
            status: '',
        });
        setData('per_page', 15);
        
        router.get('/accounting/journal-entries', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
            draft: 'secondary',
            posted: 'default',
        };
        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize">
                {status}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Journal Entries', href: '#' }]}>
            <Head title="Journal Entries" />
            
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader 
                    title="Journal Entries" 
                    description="Record and manage manual financial transactions."
                >
                     <Button asChild>
                        <Link href="/accounting/journal-entries/create">
                            <Plus className="mr-2 h-4 w-4" /> New Entry
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="p-0 gap-0">
                    <Tabs
                        value={data.filter.status || 'all'}
                        onValueChange={(value) => {
                            const newStatus = value === 'all' ? '' : value;
                            const newFilter = { ...data.filter, status: newStatus };
                            setData('filter', newFilter);
                            router.get('/accounting/journal-entries', { filter: newFilter, per_page: data.per_page }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        className="w-full"
                    >
                        <div className="p-2 border-b flex justify-between items-center bg-transparent">
                            <TabsList className="w-auto justify-start bg-transparent p-0 h-auto">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    All Entries
                                </TabsTrigger>
                                {filterOptions?.statuses.map((stat) => (
                                    <TabsTrigger
                                        key={stat}
                                        value={stat}
                                        className="capitalize data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                    >
                                        {stat}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search reference or description..."
                                value={data.filter.global}
                                onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get('/accounting/journal-entries', { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }
                                }}
                                className="pl-8 w-full"
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            {(data.filter.global || data.filter.status) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearFilters}
                                    className="h-9 w-9"
                                    title="Clear filters"
                                >
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Lines</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No journal entries found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                entries.data.map((entry) => (
                                    <TableRow
                                        key={entry.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => router.visit(`/accounting/journal-entries/${entry.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <span>{entry.reference_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(entry.date), 'PP')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px] truncate text-muted-foreground italic">
                                                {entry.description || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{entry.lines_count}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(entry.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <DataTablePagination 
                        links={entries.links}
                        from={entries.from}
                        to={entries.to}
                        total={entries.total}
                        per_page={data.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            router.get('/accounting/journal-entries', 
                                { filter: data.filter, per_page: value, page: 1 }, 
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                        onPageChange={(url) => {
                             if (url) get(url);
                        }}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
