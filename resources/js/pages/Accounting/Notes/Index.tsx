import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { Plus, Eye, Pencil, Trash2, Search, X } from 'lucide-react';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/use-currency';

interface Note {
    id: number;
    type: 'credit' | 'debit';
    reference_number: string;
    date: string;
    reference_type: string;
    reference_id: number;
    amount: number;
    reason: string;
    status: 'draft' | 'posted' | 'applied' | 'void';
    contact: {
        id: number;
        name: string;
        company_name?: string;
    };
}

interface Props {
    notes: {
        data: Note[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        type?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ notes, filters }: Props) {
    const { format } = useCurrency();
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = () => {
        router.get('/accounting/notes', { 
            search: search || undefined,
            type: type !== 'all' ? type : undefined,
            status: status !== 'all' ? status : undefined
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('all');
        setStatus('all');
        router.get('/accounting/notes');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
            posted: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            applied: 'bg-green-100 text-green-800 hover:bg-green-100',
            void: 'bg-red-100 text-red-800 hover:bg-red-100',
        };
        return <Badge className={variants[status] || 'bg-gray-100'}>{status.toUpperCase()}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        return (
            <Badge variant="outline" className={type === 'credit' ? 'text-green-600 border-green-200' : 'text-orange-600 border-orange-200'}>
                {type === 'credit' ? 'Credit Note' : 'Debit Note'}
            </Badge>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Credit/Debit Notes', href: '/accounting/notes' },
            ]}
        >
            <Head title="Credit/Debit Notes" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Credit/Debit Notes"
                    description="Manage credit and debit notes for invoice and bill adjustments."
                >
                    <div className="flex gap-2">
                         <Button asChild>
                            <Link href="/accounting/notes/create?type=credit">
                                <Plus className="mr-2 h-4 w-4" /> Credit Note
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                             <Link href="/accounting/notes/create?type=debit">
                                <Plus className="mr-2 h-4 w-4" /> Debit Note
                            </Link>
                        </Button>
                    </div>
                </PageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search reference or contact..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-8"
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={type} onValueChange={(val) => { setType(val); setTimeout(handleSearch, 0); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="credit">Credit Note</SelectItem>
                                        <SelectItem value="debit">Debit Note</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={status} onValueChange={(val) => { setStatus(val); setTimeout(handleSearch, 0); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="posted">Posted</SelectItem>
                                        <SelectItem value="applied">Applied</SelectItem>
                                        <SelectItem value="void">Void</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={handleSearch}>Filter</Button>
                                {(search || type !== 'all' || status !== 'all') && (
                                    <Button variant="ghost" size="icon" onClick={handleReset}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notes.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                                No notes found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        notes.data.map((note) => (
                                            <TableRow key={note.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">
                                                    <Link href={`/accounting/notes/${note.id}`} className="hover:underline text-primary">
                                                        {note.reference_number}
                                                    </Link>
                                                    {note.reference_id && (
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            Ref: {note.reference_type} #{note.reference_id}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getTypeBadge(note.type)}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{note.contact.company_name || note.contact.name}</div>
                                                </TableCell>
                                                <TableCell>{new Date(note.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{getStatusBadge(note.status)}</TableCell>
                                                <TableCell className="text-right font-mono font-medium">
                                                    {format(note.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {note.status === 'draft' && (
                                                            <Link href={`/accounting/notes/${note.id}/edit`}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Link href={`/accounting/notes/${note.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {notes.last_page > 1 && (
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    Page {notes.current_page} of {notes.last_page}
                                </div>
                                <div className="space-x-2">
                                    {notes.links.map((link, i) => (
                                        link.url ? (
                                            <Button
                                                key={i}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        ) : (
                                            <span key={i} dangerouslySetInnerHTML={{ __html: link.label }} className="px-2 text-muted-foreground" />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

