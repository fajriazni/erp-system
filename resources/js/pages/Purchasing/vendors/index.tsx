import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { PageHeader } from '@/components/ui/page-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Plus, Search, Building2, Mail, Phone, Star, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    type: string;
    rating_score: number | null;
    on_time_rate: number | null;
    created_at: string;
    onboarding?: {
        status: 'pending' | 'in_review' | 'approved' | 'rejected';
    } | null;
}

interface Props {
    vendors: {
        data: Vendor[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    filterOptions?: {
        categories: string[];
        industries: string[];
        statuses: string[];
        onboardingStatuses: Array<{ value: string; label: string }>;
    };
    filters?: {
        filter?: {
            global?: string;
            category?: string;
            industry?: string;
            status?: string;
            onboarding_status?: string;
        };
    };
}

export default function VendorsIndex({ vendors, filterOptions, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        filter: {
            global: filters?.filter?.global || '',
            category: filters?.filter?.category || '',
            industry: filters?.filter?.industry || '',
            status: filters?.filter?.status || '',
            onboarding_status: filters?.filter?.onboarding_status || '',
        },
        per_page: vendors.per_page || 15,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/purchasing/vendors', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setData('filter', {
            global: '',
            category: '',
            industry: '',
            status: '',
            onboarding_status: '',
        });
        // Reset per_page to default 15
        setData('per_page', 15);
        
        router.get('/purchasing/vendors', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getRatingStars = (rating: number | null) => {
        if (!rating) return <span className="text-muted-foreground text-sm">No rating</span>;

        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400 inline" />);
            } else {
                stars.push(<Star key={i} className="h-3 w-3 text-gray-300 inline" />);
            }
        }
        return <div className="flex items-center gap-1">{stars} <span className="text-sm ml-1">{Number(rating).toFixed(1)}</span></div>;
    };

    const getOnboardingStatusIcon = (onboarding?: { status: string } | null) => {
        if (!onboarding) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Clock className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>No onboarding</p>
                    </TooltipContent>
                </Tooltip>
            );
        }

        switch (onboarding.status) {
            case 'approved':
                return (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <CheckCircle2 className="h-4 w-4 text-green-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Verified</p>
                        </TooltipContent>
                    </Tooltip>
                );
            case 'rejected':
                return (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <XCircle className="h-4 w-4 text-red-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Rejected</p>
                        </TooltipContent>
                    </Tooltip>
                );
            case 'pending':
            case 'in_review':
            default:
                return (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Clock className="h-4 w-4 text-amber-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Pending</p>
                        </TooltipContent>
                    </Tooltip>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'Suppliers', href: '#' }]}>
            <Head title="Supplier Registry" />
            <TooltipProvider>
                <div className="flex flex-1 flex-col gap-4 pt-0">

                    <PageHeader 
                        title="Supplier Registry" 
                        description="Manage your vendor and supplier information."
                    >
                         <Button asChild>
                            <Link href="/purchasing/vendors/create">
                                <Plus className="mr-2 h-4 w-4" /> New Vendor
                            </Link>
                        </Button>
                    </PageHeader>

                    <Card className='p-0 gap-0'>
                        <Tabs
                            value={data.filter.status || 'all'}
                            onValueChange={(value) => {
                                const newStatus = value === 'all' ? '' : value;
                                const newFilter = { ...data.filter, status: newStatus };
                                setData('filter', newFilter);
                                router.get('/purchasing/vendors', { filter: newFilter, per_page: data.per_page }, {
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
                                        All Statuses
                                    </TabsTrigger>
                                    {filterOptions?.statuses.map((stat) => (
                                        <TabsTrigger
                                            key={stat}
                                            value={stat}
                                            className="capitalize data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                                        >
                                            {stat.replace(/_/g, ' ')}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </Tabs>
                        <div className="p-4 border-b flex justify-between items-center gap-4">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={data.filter.global}
                                    onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            router.get('/purchasing/vendors', { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                        }
                                    }}
                                    className="pl-8 w-full"
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                <Select
                                    value={data.filter.category || '_all'}
                                    onValueChange={(value) => {
                                        const newVal = value === '_all' ? '' : value;
                                        const newFilter = { ...data.filter, category: newVal };
                                        setData('filter', newFilter);
                                        router.get('/purchasing/vendors', { filter: newFilter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] h-9">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All Categories</SelectItem>
                                        {filterOptions?.categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={data.filter.industry || '_all'}
                                    onValueChange={(value) => {
                                        const newVal = value === '_all' ? '' : value;
                                        const newFilter = { ...data.filter, industry: newVal };
                                        setData('filter', newFilter);
                                        router.get('/purchasing/vendors', { filter: newFilter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] h-9">
                                        <SelectValue placeholder="Industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All Industries</SelectItem>
                                        {filterOptions?.industries.map((ind) => (
                                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={data.filter.onboarding_status || '_all'}
                                    onValueChange={(value) => {
                                        const newVal = value === '_all' ? '' : value;
                                        const newFilter = { ...data.filter, onboarding_status: newVal };
                                        setData('filter', newFilter);
                                        router.get('/purchasing/vendors', { filter: newFilter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] h-9">
                                        <SelectValue placeholder="Onboarding" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All Onboarding</SelectItem>
                                        {filterOptions?.onboardingStatuses.map((stat) => (
                                            <SelectItem key={stat.value} value={stat.value}>{stat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(data.filter.global || data.filter.category || data.filter.industry || data.filter.status || data.filter.onboarding_status) && (
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
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Performance Rating</TableHead>
                                    <TableHead>On-Time Delivery</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendors.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No vendors found. Create your first vendor to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vendors.data.map((vendor) => (
                                        <TableRow
                                            key={vendor.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(`/purchasing/vendors/${vendor.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {getOnboardingStatusIcon(vendor.onboarding)}
                                                    <span>{vendor.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-muted-foreground gap-1">
                                                    {vendor.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {vendor.email}</div>}
                                                    {vendor.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {vendor.phone}</div>}
                                                    {!vendor.email && !vendor.phone && <span>-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {vendor.type === 'both' ? 'Vendor & Customer' : vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getRatingStars(vendor.rating_score)}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.on_time_rate ? (
                                                    <Badge variant={Number(vendor.on_time_rate) >= 90 ? 'default' : 'secondary'} className={Number(vendor.on_time_rate) >= 90 ? 'bg-green-600' : ''}>
                                                        {Number(vendor.on_time_rate).toFixed(1)}%
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <DataTablePagination 
                            links={vendors.links}
                            from={vendors.from}
                            to={vendors.to}
                            total={vendors.total}
                            per_page={data.per_page}
                            onPerPageChange={(value) => {
                                setData('per_page', value);
                                router.get('/purchasing/vendors', 
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
            </TooltipProvider>
        </AppLayout>
    );
}
