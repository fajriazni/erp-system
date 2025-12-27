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
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Eye } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/datatable-pagination';
import { format } from 'date-fns';
import * as Payment from '@/actions/App/Http/Controllers/Accounting/CustomerPaymentController';

interface CustomerPayment {
  id: number;
  payment_number: string;
  date: string;
  amount: number;
  payment_method: string;
  status: string;
  customer?: { company_name?: string; name: string };
}

interface PageProps {
  payments: {
    data: CustomerPayment[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
  };
}

export default function Index({ payments }: PageProps) {
    const { data, setData, get } = useForm({
        search: '',
    });

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
             get(Payment.index.url(), { preserveState: true });
        }
    };

  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' },{ title: 'Customer Payments', href: '#' }]}>
      <Head title="Customer Payments" />
      
      <PageHeader title="Customer Payments" description="Manage payments received from customers.">
          <Button onClick={() => router.visit(Payment.create.url())}>
              <Plus className="mr-2 h-4 w-4" />
              Receive Payment
          </Button>
      </PageHeader>

      <div className="flex flex-col gap-4">
          <Card>
              <CardContent className="p-0">
                  <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-b">
                      <div className="flex items-center gap-2 flex-1 w-full">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <Input 
                              placeholder="Search payments..." 
                              value={data.search}
                              onChange={e => setData('search', e.target.value)}
                              className="max-w-xs"
                              onKeyDown={handleSearch}
                          />
                      </div>
                  </div>

                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Number</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {payments.data.map((payment) => (
                              <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.visit(Payment.show.url(payment.id))}>
                                  <TableCell className="font-medium">{payment.payment_number}</TableCell>
                                  <TableCell>{payment.customer?.company_name || payment.customer?.name}</TableCell>
                                  <TableCell>{format(new Date(payment.date), 'MMM dd, yyyy')}</TableCell>
                                  <TableCell className="capitalize">{payment.payment_method.replace('_', ' ')}</TableCell>
                                  <TableCell className="text-right font-medium">
                                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount)}
                                  </TableCell>
                                  <TableCell>
                                      <Badge variant={payment.status === 'posted' ? 'default' : 'secondary'} className="capitalize">
                                          {payment.status}
                                      </Badge>
                                  </TableCell>
                                  <TableCell>
                                      <Button variant="ghost" size="icon" asChild>
                                          <Link href={Payment.show.url(payment.id)}>
                                             <Eye className="h-4 w-4" />
                                          </Link>
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                          {payments.data.length === 0 && (
                              <TableRow>
                                  <TableCell colSpan={7} className="h-24 text-center">
                                      No payments found.
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
                   <div className="py-2">
                       <DataTablePagination links={payments.links} />
                   </div>
              </CardContent>
          </Card>
      </div>
    </AppLayout>
  );
}
