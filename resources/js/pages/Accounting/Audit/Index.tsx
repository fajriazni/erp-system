import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface AuditEntry {
    id: number;
    user_name: string;
    action: string;
    model: string;
    model_id: number;
    changes: Record<string, any>;
    ip_address: string;
    created_at: string;
}

interface Props {
    auditLogs: {
        data: AuditEntry[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        action?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ auditLogs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get('/accounting/audit', {
            search,
            action,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setAction('');
        setDateFrom('');
        setDateTo('');
        router.get('/accounting/audit');
    };

    const getActionBadge = (action: string) => {
        const variants: Record<string, string> = {
            created: 'bg-green-100 text-green-800',
            updated: 'bg-blue-100 text-blue-800',
            deleted: 'bg-red-100 text-red-800',
            posted: 'bg-purple-100 text-purple-800',
        };
        return variants[action.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Audit Trail', href: '/accounting/audit' },
            ]}
        >
            <Head title="Audit Trail" />
            
            <PageHeader
                title="Audit Trail"
                description="Track all accounting activities and changes"
            />

            <div className="space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="action">Action</Label>
                                <Select value={action} onValueChange={setAction}>
                                    <SelectTrigger id="action">
                                        <SelectValue placeholder="All Actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Actions</SelectItem>
                                        <SelectItem value="created">Created</SelectItem>
                                        <SelectItem value="updated">Updated</SelectItem>
                                        <SelectItem value="deleted">Deleted</SelectItem>
                                        <SelectItem value="posted">Posted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date From</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to">Date To</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleFilter}>
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Log Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {auditLogs.data.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No audit logs found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {auditLogs.data.map((log) => (
                                    <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getActionBadge(log.action)}>
                                                        {log.action.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm font-medium">{log.model}</span>
                                                    <span className="text-sm text-muted-foreground">#{log.model_id}</span>
                                                </div>
                                                
                                                <div className="text-sm text-muted-foreground">
                                                    By <span className="font-medium">{log.user_name}</span> 
                                                    {' from '} 
                                                    <span className="font-mono text-xs">{log.ip_address}</span>
                                                </div>

                                                {log.changes && Object.keys(log.changes).length > 0 && (
                                                    <details className="mt-2">
                                                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                                            View Changes
                                                        </summary>
                                                        <div className="mt-2 bg-muted p-3 rounded text-xs font-mono">
                                                            <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                                                        </div>
                                                    </details>
                                                )}
                                            </div>

                                            <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                                {formatDate(log.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {auditLogs.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {auditLogs.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`px-3 py-1 border rounded ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background hover:bg-muted'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
