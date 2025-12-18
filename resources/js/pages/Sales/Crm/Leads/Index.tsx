import { Head, Link, useForm, router } from '@inertiajs/react';
import * as Leads from '@/actions/App/Http/Controllers/Sales/Crm/LeadController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, MoreHorizontal, MessageSquare, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lead {
    id: number;
    first_name: string;
    last_name: string;
    company_name: string;
    email: string;
    phone: string;
    status: string;
    owner?: { name: string };
    created_at: string;
}

interface Props {
    leads: {
        data: Lead[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function LeadsIndex({ leads, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(Leads.index.url(), { preserveState: true });
    };

    const statusColors: Record<string, string> = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        qualified: 'bg-green-100 text-green-800',
        unqualified: 'bg-red-100 text-red-800',
        converted: 'bg-purple-100 text-purple-800',
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Leads', href: '#' }]}>
            <Head title="Leads" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
                        <p className="text-muted-foreground">Manage your sales leads and prospects.</p>
                    </div>
                    <Button asChild>
                        <Link href={Leads.create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> New Lead
                        </Link>
                    </Button>
                </div>

                <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <Input
                            placeholder="Search leads..."
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary" disabled={processing}>
                            <Search className="h-4 w-4 mr-2" /> Search
                        </Button>
                    </form>
                </div>

                <Card>
                    <CardHeader className="p-0" />
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No leads found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.data.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell className="font-medium">
                                                {lead.first_name} {lead.last_name}
                                            </TableCell>
                                            <TableCell>{lead.company_name || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-muted-foreground gap-1">
                                                    {lead.email && <div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {lead.email}</div>}
                                                    {lead.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={statusColors[lead.status] || ''}>
                                                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{lead.owner?.name || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.visit(Leads.edit.url(lead.id))}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                if(confirm('Are you sure?')) router.delete(Leads.destroy.url(lead.id))
                                                            }}
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
