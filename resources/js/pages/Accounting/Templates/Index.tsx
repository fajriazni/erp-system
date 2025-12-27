import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, ChevronRight, FileText, XCircle } from 'lucide-react';

interface TemplateLine {
    id: number;
    account: {
        code: string;
        name: string;
    };
    debit_credit: 'debit' | 'credit';
}

interface Template {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    lines: TemplateLine[];
    created_at: string;
}

interface Props {
    templates: {
        data: Template[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    filters?: {
        filter?: {
            global?: string;
            status?: string;
        };
    };
}

export default function Index({ templates, filters }: Props) {
    const { data, setData, get } = useForm({
        filter: {
            global: filters?.filter?.global || '',
            status: filters?.filter?.status || '',
        },
        per_page: templates.per_page || 15,
    });

    const handleClearFilters = () => {
        setData('filter', {
            global: '',
            status: '',
        });
        setData('per_page', 15);
        
        router.get('/accounting/templates', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Accounting', href: '/accounting' },
        { title: 'Journal Templates', href: '/accounting/templates' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journal Templates" />
            
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <PageHeader
                    title="Journal Templates"
                    description="Create and manage reusable journal entry templates"
                >
                    <Link href="/accounting/templates/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Template
                        </Button>
                    </Link>
                </PageHeader>

                <Card className="p-0 gap-0">
                    <Tabs
                        value={data.filter.status || 'all'}
                        onValueChange={(value) => {
                            const newStatus = value === 'all' ? '' : value;
                            const newFilter = { ...data.filter, status: newStatus };
                            setData('filter', newFilter);
                            router.get('/accounting/templates', { filter: newFilter, per_page: data.per_page }, {
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
                                    All Templates
                                </TabsTrigger>
                                <TabsTrigger
                                    value="active"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Active
                                </TabsTrigger>
                                <TabsTrigger
                                    value="inactive"
                                    className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                >
                                    Inactive
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search templates..."
                                value={data.filter.global}
                                onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get('/accounting/templates', { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
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
                                <TableHead className="w-[300px]">Template Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Lines</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No templates found. Create your first template to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templates.data.map((template) => (
                                    <TableRow 
                                        key={template.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/accounting/templates/${template.id}`)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {template.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground line-clamp-1">
                                                {template.description || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {template.lines.length} Lines
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={template.is_active ? 'default' : 'secondary'} className={template.is_active ? 'bg-green-600' : ''}>
                                                {template.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    
                    <DataTablePagination 
                        links={templates.links}
                        from={templates.from}
                        to={templates.to}
                        total={templates.total}
                        per_page={data.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            router.get('/accounting/templates', 
                                { filter: data.filter, per_page: value, page: 1 }, 
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                        onPageChange={(url) => {
                             get(url);
                        }}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
