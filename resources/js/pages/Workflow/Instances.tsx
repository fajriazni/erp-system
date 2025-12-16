import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity, CheckCircle, XCircle, Clock, Search, Filter, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';



interface WorkflowInstance {
    id: number;
    status: string;
    created_at: string;
    completed_at: string | null;
    workflow: {
        name: string;
    };
    current_step: {
        name: string;
    } | null;
    entity: any;
    approval_tasks: Array<{
        user?: { name: string };
        role?: { name: string };
    }>;
}

export default function Instances({
    instances,
    filters,
}: {
    instances: {
        data: WorkflowInstance[];
        links: any[]; 
        total: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
    filters: any;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [entityType, setEntityType] = useState(filters.entity_type || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Reset selection when data changes
    useEffect(() => {
        setSelectedIds([]);
    }, [instances.data]);

    const handleFilter = () => {
        router.get(
            '/workflows/instances',
            {
                search: searchTerm,
                status: status === 'all' ? '' : status,
                entity_type: entityType === 'all' ? '' : entityType,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatus('all');
        setEntityType('all');
        router.get('/workflows/instances');
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(instances.data.map(i => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleBulkCancel = () => {
        if (selectedIds.length === 0) return;
        
        if (!confirm(`Are you sure you want to cancel ${selectedIds.length} selected workflows?`)) return;

        router.post('/workflows/instances/bulk', {
            ids: selectedIds,
            action: 'cancel',
            reason: 'Bulk cancellation by user',
        }, {
            onSuccess: () => {
                toast.success('Workflows cancelled successfully');
                setSelectedIds([]);
            },
            onError: () => {
                toast.error('Failed to process bulk action');
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; icon: any }> = {
            active: { variant: 'default', label: 'Active', icon: Activity },
            completed: { variant: 'success', label: 'Completed', icon: CheckCircle },
            rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
            cancelled: { variant: 'secondary', label: 'Cancelled', icon: XCircle },
        };

        const config = variants[status] || { variant: 'secondary', label: status, icon: Clock };
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Workflow Instances" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Workflow Instances</h1>
                        <p className="text-muted-foreground text-sm">
                            View and manage all workflow instances across the system
                        </p>
                    </div>
                    
                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2">
                             <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        Bulk Actions <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleBulkCancel} className="text-destructive focus:text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel Selected
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                        </div>
                    )}
                </div>



                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Entity Type</label>
                                <Select value={entityType} onValueChange={setEntityType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="App\\Models\\PurchaseOrder">Purchase Order</SelectItem>
                                        <SelectItem value="App\\Models\\Invoice">Invoice</SelectItem>
                                        <SelectItem value="App\\Models\\Payment">Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    Apply Filters
                                </Button>
                                <Button onClick={handleReset} variant="outline">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Instances</CardTitle>
                        <CardDescription>
                            Showing {instances.data.length} of {instances.total} instances
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            checked={instances.data.length > 0 && selectedIds.length === instances.data.length}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        />
                                    </TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Workflow</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Current Step</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {instances.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                                            No workflow instances found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    instances.data.map((instance) => (
                                        <TableRow key={instance.id}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedIds.includes(instance.id)}
                                                    onCheckedChange={(checked) => handleSelectRow(instance.id, !!checked)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{instance.id}</TableCell>
                                            <TableCell>{instance.workflow.name}</TableCell>
                                            <TableCell>
                                                {instance.entity?.document_number || `#${instance.entity?.id}` || 'N/A'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(instance.status)}</TableCell>
                                            <TableCell>
                                                {instance.current_step?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {instance.approval_tasks.length > 0
                                                    ? instance.approval_tasks
                                                          .map((t) => t.user?.name || t.role?.name)
                                                          .filter(Boolean)
                                                          .join(', ')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(instance.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    asChild
                                                >
                                                    <Link href={`/workflows/instances/${instance.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {instances.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {instances.from} to {instances.to} of {instances.total} results
                                </p>
                                <div className="flex gap-2">
                                    {instances.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            size="sm"
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
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
