import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Plus, Search, Filter, Bell, ChevronRight, XCircle } from 'lucide-react';
import { index, show, create, edit, alerts } from "@/routes/purchasing/contracts"
import { format } from "date-fns";

interface Agreement {
  id: number
  reference_number: string
  title: string
  vendor: {
    name: string
  }
  start_date: string
  end_date: string | null
  status: string
  total_value_cap: string | null
}

interface Props {
  agreements: {
    data: Agreement[]
    links: any[]
    from: number
    to: number
    total: number
    current_page: number
    last_page: number
    per_page: number
  }
  filters?: {
    search?: string
    status?: string
  }
}

export default function ContractsIndex({ agreements, filters }: Props) {
  const { data, setData, get, processing } = useForm({
    search: filters?.search || '',
    status: filters?.status || 'all',
    per_page: agreements.per_page || 10,
  })

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
       router.get(index().url, { 
           search: data.search, 
           status: data.status === 'all' ? '' : data.status 
       }, { 
           preserveState: true, 
           preserveScroll: true 
       });
    }
  }

  const handleStatusChange = (value: string) => {
      setData('status', value);
      router.get(index().url, { 
          search: data.search, 
          status: value === 'all' ? '' : value 
      }, { 
          preserveState: true, 
          preserveScroll: true 
      });
  }

  const clearFilters = () => {
      setData({ ...data, search: '', status: 'all' });
      router.get(index().url, {}, { preserveState: true, preserveScroll: true });
  }

  const breadcrumbs = [
    { title: "Purchasing", href: "/purchasing" },
    { title: "Contracts", href: "/purchasing/contracts" },
  ]

  const getStatusBadge = (status: string) => {
      const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
        active: "default",
        expired: "destructive",
        terminated: "destructive",
        draft: "secondary",
        pending_approval: "secondary",
      }
      return (
        <Badge variant={variants[status] || "secondary"} className="capitalize">
          {status.split('_').join(' ')}
        </Badge>
      )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Purchase Agreements" />
      <div className="flex flex-1 flex-col gap-4 pt-0">
          <PageHeader
            title="Purchase Agreements"
            description="Manage vendor contracts and purchase agreements."
          >
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                    <Link href={alerts().url}>
                        <Bell className="mr-2 h-4 w-4" />
                        Renewal Alerts
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={create().url}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Agreement
                    </Link>
                </Button>
              </div>
          </PageHeader>

          <Card className="p-0 gap-0">
             <Tabs
                value={data.status}
                onValueChange={handleStatusChange}
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
                        <TabsTrigger value="active" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">Active</TabsTrigger>
                        <TabsTrigger value="expired" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">Expired</TabsTrigger>
                        <TabsTrigger value="terminated" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">Terminated</TabsTrigger>
                        <TabsTrigger value="draft" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2">Draft</TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            <div className="p-4 border-b flex justify-between items-center gap-4">
                 <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search contracts..."
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        onKeyDown={handleSearch}
                        className="pl-8 w-full"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    {(data.search || data.status !== 'all') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearFilters}
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
                        <TableHead>Title</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {agreements.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No agreements found. Create your first agreement to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        agreements.data.map((row) => (
                            <TableRow 
                                key={row.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => router.visit(show(row.id).url)}
                            >
                                <TableCell className="font-medium">
                                    {row.reference_number}
                                </TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell>{row.vendor.name}</TableCell>
                                <TableCell>{row.start_date ? format(new Date(row.start_date), "PPP") : "-"}</TableCell>
                                <TableCell>{row.end_date ? format(new Date(row.end_date), "PPP") : "No Expiry"}</TableCell>
                                <TableCell>
                                    {getStatusBadge(row.status)}
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
                links={agreements.links}
                from={agreements.from}
                to={agreements.to}
                total={agreements.total}
                per_page={data.per_page}
                onPerPageChange={(value) => {
                    setData('per_page', value);
                    router.get(index().url, 
                        { search: data.search, status: data.status === 'all' ? '' : data.status, per_page: value, page: 1 }, 
                        { preserveState: true, preserveScroll: true }
                    );
                }}
                onPageChange={(url) => {
                        router.visit(url); // Pagination links are full URLs
                }}
            />
          </Card>
      </div>
    </AppLayout>
  )
}
