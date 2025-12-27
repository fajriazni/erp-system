import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { FileText, Calculator, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    summary: {
        output_vat: number;
        input_vat: number;
        payable: number;
    };
}

export default function VAT({ summary }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Tax', href: '/accounting/tax' },
                { title: 'VAT', href: '/accounting/tax/vat' },
            ]}
        >
            <Head title="VAT Management" />
            
            <PageHeader
                title="VAT/PPN Management"
                description="Manage Value Added Tax (PPN) reporting and compliance"
            />

            <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Output VAT (Sales)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary?.output_vat || 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Input VAT (Purchases)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(summary?.input_vat || 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">VAT Payable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary?.payable || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>VAT Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        VAT transaction tracking will be displayed here
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
