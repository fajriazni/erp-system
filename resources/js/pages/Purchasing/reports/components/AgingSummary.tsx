import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/hooks/use-currency';

interface AgingData {
    '0-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
}

export default function AgingSummary({ data }: { data: AgingData }) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Payable Aging Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <AgingCard label="Current (0-30)" amount={data['0-30']} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" />
                    <AgingCard label="31-60 Days" amount={data['31-60']} color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" />
                    <AgingCard label="61-90 Days" amount={data['61-90']} color="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" />
                    <AgingCard label="Over 90 Days" amount={data['90+']} color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" />
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Total Payables</span>
                    <span className="text-xl font-bold">
                        {useCurrency().format(total)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function AgingCard({ label, amount, color }: { label: string, amount: number, color: string }) {
    return (
        <div className={`p-4 rounded-lg flex flex-col justify-between ${color}`}>
            <span className="text-sm font-medium opacity-80">{label}</span>
            <span className="text-lg font-bold mt-1 truncate">
                {new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(amount)}
            </span>
        </div>
    );
}
