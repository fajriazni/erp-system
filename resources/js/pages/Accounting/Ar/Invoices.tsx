import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Search, ChevronRight, FileText, Calendar, XCircle, User } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTablePagination } from '@/components/datatable-pagination';
import { format } from 'date-fns';
import * as Invoice from '@/actions/App/Http/Controllers/Accounting/CustomerInvoiceController';

interface InvoiceType {
  id: number;
  invoice_number: string;
  date: string;
  due_date: string;
  status: string;
  total_amount: string;
  customer?: { company_name?: string; name: string };
}

interface PageProps {
  invoices: {
    data: InvoiceType[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
  };
}

export default function Invoices({ invoices }: PageProps) {
    const { data, setData, get } = useForm({
        filter: {
            global: '',
            status: '',
        },
        per_page: invoices.per_page || 15,
    });

    const handleClearFilters = () => {
        setData('filter', {
            global: '',
            status: '',
        });
        router.get(Invoice.index.url(), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
            draft: 'secondary',
            posted: 'default',
            paid: 'outline',
        };
        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize">
                {status}
            </Badge>
        );
    };

  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' },{ title: 'Customer Invoices', href: '#' }]}>
      <Head title="Customer Invoices" />
      
      <div className="flex flex-1 flex-col gap-4 pt-0">
          <PageHeader title="Customer Invoices" description="Manage customer invoices and receivables.">
              <Button asChild>
                  <Link href={Invoice.create.url()}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Invoice
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
                      router.get(Invoice.index.url(), { filter: newFilter, per_page: data.per_page }, {
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
                              All Invoices
                          </TabsTrigger>
                          <TabsTrigger
                              value="draft"
                              className="capitalize data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                          >
                              Draft
                          </TabsTrigger>
                          <TabsTrigger
                              value="posted"
                              className="capitalize data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                          >
                              Posted
                          </TabsTrigger>
                          <TabsTrigger
                              value="paid"
                              className="capitalize data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-4 py-2"
                          >
                              Paid
                          </TabsTrigger>
                      </TabsList>
                  </div>
              </Tabs>

              <div className="p-4 border-b flex justify-between items-center gap-4">
                  <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          placeholder="Search invoice number or customer..."
                          value={data.filter.global}
                          onChange={(e) => setData('filter', { ...data.filter, global: e.target.value })}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  router.get(Invoice.index.url(), { filter: data.filter, per_page: data.per_page }, { preserveState: true, preserveScroll: true });
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
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {invoices.data.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                  No invoices found.
                              </TableCell>
                          </TableRow>
                      ) : (
                          invoices.data.map((inv) => (
                              <TableRow
                                  key={inv.id}
                                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => router.visit(Invoice.show.url(inv.id))}
                              >
                                  <TableCell className="font-medium">
                                      <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-slate-400" />
                                          <span>{inv.invoice_number}</span>
                                      </div>
                                  </TableCell>
                                  <TableCell>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                          <User className="h-3 w-3" />
                                          {inv.customer?.company_name || inv.customer?.name}
                                      </div>
                                  </TableCell>
                                  <TableCell>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                          <Calendar className="h-3 w-3" />
                                          {format(new Date(inv.date), 'PP')}
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                      {inv.due_date ? format(new Date(inv.due_date), 'PP') : '-'}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(inv.total_amount))}
                                  </TableCell>
                                  <TableCell>
                                      {getStatusBadge(inv.status)}
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
                  links={invoices.links}
                  from={invoices.from}
                  to={invoices.to}
                  total={invoices.total}
                  per_page={data.per_page}
                  onPerPageChange={(value) => {
                      setData('per_page', value);
                      router.get(Invoice.index.url(), 
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
