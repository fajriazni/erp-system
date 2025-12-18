import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';

export default function FinanceDashboard() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Finance Dashboard', href: '/finance' }]}>
      <Head title="Finance Dashboard" />
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Cash
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Accounts Receivable
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$23,450.00</div>
                    <p className="text-xs text-muted-foreground">
                        +15% from last month
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
