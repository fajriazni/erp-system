import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpendData {
    month: string;
    amount: number;
}

export default function SpendChart({ data }: { data: SpendData[] }) {
    const maxAmount = Math.max(...data.map(d => d.amount), 1); // Avoid div by zero

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Spend Analysis (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 pt-4">
                    {data.map((item, index) => {
                        const heightPercentage = (item.amount / maxAmount) * 100;
                        return (
                            <div key={index} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex items-end justify-center h-full bg-muted/20 rounded-t-md overflow-hidden">
                                    <div 
                                        className="w-full bg-primary/80 hover:bg-primary transition-all duration-500 rounded-t-md relative group-hover:opacity-90"
                                        style={{ height: `${heightPercentage}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow whitespace-nowrap z-10">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
                                    {item.month}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
