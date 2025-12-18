import { Head, Link, useForm, router } from '@inertiajs/react';
import * as Deals from '@/actions/App/Http/Controllers/Sales/Crm/DealController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Deal {
    id: number;
    title: string;
    amount: number;
    stage: string;
    contact?: { name: string; company_name?: string };
    owner?: { name: string };
    probability: number;
    close_date: string;
}

interface Props {
    deals: Deal[];
    columns: Record<string, string>;
}

export default function DealsIndex({ deals, columns }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const handleStageChange = (dealId: number, newStage: string) => {
        router.post(Deals.updateStage.url(dealId), { stage: newStage }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Deals', href: '#' }]}>
            <Head title="Deals Pipeline" />
            <div className="flex flex-1 flex-col h-full gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Deals Pipeline</h2>
                    <Button asChild>
                        <Link href={Deals.create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> New Deal
                        </Link>
                    </Button>
                </div>

                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 h-full min-w-[1000px]">
                        {Object.entries(columns).map(([stageKey, stageLabel]) => {
                            const stageDeals = deals.filter(d => d.stage === stageKey);
                            const totalAmount = stageDeals.reduce((sum, d) => sum + Number(d.amount), 0);

                            return (
                                <div key={stageKey} className="flex-1 min-w-[280px] flex flex-col bg-muted/30 rounded-lg border p-3 gap-3 h-fit max-h-full">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold text-sm uppercase text-muted-foreground">{stageLabel}</h3>
                                        <Badge variant="secondary" className="rounded-full px-2 text-xs">{stageDeals.length}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono mb-2">
                                        {formatCurrency(totalAmount)}
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 overflow-y-auto">
                                        {stageDeals.map(deal => (
                                            <Card key={deal.id} className="shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                                                <CardContent className="p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-medium text-sm line-clamp-2">{deal.title}</span>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-6 w-6 p-0 -mt-1 -mr-1">
                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div className="text-sm font-semibold text-primary">
                                                            {formatCurrency(deal.amount)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            P: {deal.probability}%
                                                        </div>
                                                    </div>
                                                    {deal.contact && (
                                                        <div className="mt-2 text-xs text-muted-foreground border-t pt-2 mt-2">
                                                            {deal.contact.company_name || deal.contact.name}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
