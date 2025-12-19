import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText, ChevronRight } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { index, create, show } from '@/actions/App/Http/Controllers/Purchasing/PurchaseRequestController';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PurchaseRequest {
    id: number;
    document_number: string;
    date: string;
    requester: {
        id: number;
        name: string;
    };
    status: string;
    created_at: string;
    items_count: number;
}

interface Props {
    requests: {
        data: PurchaseRequest[];
        links: any[];
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters?: any;
}

export default function PurchaseRequestIndex({ requests, filters }: Props) {
    const { data: formData, setData, get } = useForm({
        filter: {
            global: filters?.filter?.global || '',
            status: filters?.filter?.status || '',
        },
    });

    const [searchTerm, setSearchTerm] = useState(formData.filter.global);

    // Status tabs configuration
    const statusTabs = [
        { value: 'all', label: 'All Requests' },
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
    ];

    // Check strict equality to prevent infinite loops
    useEffect(() => {
        if (searchTerm !== formData.filter.global) {
             const timer = setTimeout(() => {
                const newFilter = { ...formData.filter, global: searchTerm };
                setData('filter', newFilter as any);
                
                router.get(
                    index.url(),
                    { filter: newFilter, page: 1 } as any, 
                    { preserveState: true, replace: true }
                );
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const handleStatusChange = (value: string) => {
        const newStatus = value === 'all' ? '' : value;
        const newFilter = { ...formData.filter, status: newStatus };
        setData('filter', newFilter as any);
        
        router.get(
            index.url(),
            { filter: newFilter, page: 1 } as any,
            { preserveState: true, replace: true }
        );
    };
    
    const handlePageChange = (url: string) => {
        router.visit(url, { preserveState: true });
    };

    const handlePerPageChange = (value: number) => {
        router.get(
            index.url(),
            { filter: formData.filter, per_page: value, page: 1 } as any,
            { preserveState: true, replace: true }
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            submitted: { variant: 'secondary', label: 'Submitted' },
            approved: { variant: 'default', label: 'Approved' },
            rejected: { variant: 'destructive', label: 'Rejected' },
        };

        const config = variants[status] || { variant: 'outline', label: status };
        return <Badge variant={config.variant} className="capitalize">{config.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Requests', href: index.url() }
        ]}>
            <Head title="Purchase Requests" />

            <div className="container mx-auto space-y-6">
                <PageHeader
                    title="Purchase Requests"
                    description="Manage internal purchase requests."
                >
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Request
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="p-0 gap-0">
                    <Tabs
                        value={formData.filter.status || 'all'}
                        onValueChange={handleStatusChange}
                        className="w-full"
                    >
                        <div className="p-2 border-b flex justify-between items-center bg-transparent">
                            <TabsList className="w-auto justify-start bg-transparent p-0 h-auto">
                                {statusTabs.map((tab) => (
                                    <TabsTrigger 
                                        key={tab.value} 
                                        value={tab.value}
                                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="p-4 border-b flex justify-between items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search requests..."
                                className="pl-8 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Document #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Requester</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Created At</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No purchase requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.data.map((pr) => (
                                        <TableRow key={pr.id} className="group hover:bg-muted/40 cursor-pointer" onClick={() => router.visit(show.url(pr.id))}>
                                            <TableCell className="font-medium pl-6">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    {pr.document_number}
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(pr.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{pr.requester?.name || '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-center">{pr.items_count}</TableCell>
                                            <TableCell>{getStatusBadge(pr.status)}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {new Date(pr.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <DataTablePagination
                            links={requests.links}
                            from={requests.from}
                            to={requests.to}
                            total={requests.total}
                            per_page={requests.per_page}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
