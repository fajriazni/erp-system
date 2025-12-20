import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import SpendChart from './components/SpendChart';
import AgingSummary from './components/AgingSummary';
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    spendData: { month: string; key: string; amount: number }[];
    agingData: { '0-30': number; '31-60': number; '61-90': number; '90+': number };
    topVendors: { company_name: string; total_spend: number }[];
}

export default function Index({ spendData, agingData, topVendors }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Reports' }
        ]}>
            <Head title="Purchasing Reports" />
            
            <div className="container mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Purchasing Reports</h1>
                    <p className="text-muted-foreground">Analytics and insights into spending and liabilities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Main Chart - Spans 2 cols on Large screens */}
                    <div className="lg:col-span-2">
                        <SpendChart data={spendData} />
                    </div>

                    {/* Aging Summary - Spans 1 col */}
                    <div className="lg:col-span-1">
                        <AgingSummary data={agingData} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Top Vendors (YTD)</CardTitle>
                        </CardHeader>
                         <CardContent>
                             <div className="space-y-4">
                                 {topVendors.length === 0 ? (
                                     <p className="text-muted-foreground">No purchase data yet.</p>
                                 ) : (
                                     topVendors.map((vendor, idx) => (
                                         <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                     {idx + 1}
                                                 </div>
                                                 <span className="font-medium">{vendor.company_name}</span>
                                            </div>
                                             <span className="font-bold">
                                                 {useCurrency().format(vendor.total_spend)}
                                             </span>
                                         </div>
                                     ))
                                 )}
                             </div>
                         </CardContent>
                     </Card>
                </div>
            </div>
        </AppLayout>
    );
}
