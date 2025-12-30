
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ChevronLeft, Check, AlertCircle, Lock } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

const formatMoney = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
};

export default function ReconciliationShow({ reconciliation, transactions }: any) {
    const isFinalized = reconciliation.status === 'reconciled';
    const currency = reconciliation.bank_account.currency;

    // Calculate dynamic values for UI feedback
    const clearedBalance = transactions.reduce((acc: number, trx: any) => {
        // Only count if marked as part of this reconciliation (or if we toggle it locally optimistically)
        // For simpler MVP, we rely on backend state passed down.
        if (trx.bank_reconciliation_id === reconciliation.id) {
            return acc + (['deposit', 'transfer_in'].includes(trx.type) ? Number(trx.amount) : -Number(trx.amount));
        }
        return acc;
    }, 0);

    // Note: This logic assumes Statement Balance target is (Opening + Cleared). 
    // If we assume Opening Balance is correct, then Difference = Statement - (Opening + Cleared).
    // Let's assume Opening Balance is the account balance MINUS all uncleared transactions? 
    // Or simpler: We just need Cleared Balance + Opening Balance = Statement Balance.
    
    // For now, let's just show Statement Balance vs Cleared Balance difference relative to an opening snapshot.
    // Actually simpler: Difference = Statement Balance - (Currently Reconciled Balance in DB).
    // If backend updates `reconciled_balance` on every toggle, we can use that.
    
    // But `reconciled_balance` in DB is 0 initially.
    // Let's rely on frontend calculation for immediate feedback.
    
    // We need the ACTUAL opening balance of the account at start_date.
    // Assuming user inputs Statement Ending Balance.
    // Verification: (Opening Balance + Cleared Deposits - Cleared Withdrawals) == Ending Statement Balance.
    
    // Since we don't have explicit "Opening Balance" passed in the prop easily (it's complex to calc),
    // Let's simplified approach: Just show "Statement Balance" and "Cleared Items Total".
    // User mentally checks if it matches.
    // Better: Allow user to input "Difference" or just show (Statement - Cleared).
    
    const difference = Number(reconciliation.statement_balance) - (Number(reconciliation.reconciled_balance));

    const toggleTransaction = (trxId: number) => {
        if (isFinalized) return;
        router.post(route('finance.reconciliation.update', reconciliation.id), {
            transaction_id: trxId,
            _method: 'put'
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleFinalize = () => {
        if (!confirm("Are you sure you want to finalize this reconciliation? This will lock the cleared transactions.")) return;
        router.post(route('finance.reconciliation.finalize', reconciliation.id));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Reconciliation', href: '/finance/reconciliation' },
            { title: `Reference #${reconciliation.id}`, href: '#' }
        ]}>
            <Head title={`Reconcile ${reconciliation.bank_account.name}`} />
            
            <div className="flex flex-col h-[calc(100vh-65px)]">
                {/* Header */}
                <div className="border-b bg-white dark:bg-slate-950 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('finance.reconciliation.index')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">{reconciliation.bank_account.name}</h1>
                                {isFinalized && <Badge variant="secondary"><Lock className="w-3 h-3 mr-1"/> Finalized</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Period: {reconciliation.start_date} to {reconciliation.end_date}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         <div className="text-right">
                            <div className="text-xs text-muted-foreground">Statement Final Balance</div>
                            <div className="text-lg font-bold">{formatMoney(Number(reconciliation.statement_balance), currency)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground">Cleared Balance</div>
                            <div className={cn("text-lg font-bold", difference === 0 ? "text-emerald-600" : "text-amber-600")}>
                                {formatMoney(Number(reconciliation.reconciled_balance), currency)}
                            </div>
                        </div>
                        {/* 
                        <div className="text-right px-4 border-l">
                            <div className="text-xs text-muted-foreground">Difference</div>
                            <div className={cn("text-lg font-bold", difference === 0 ? "text-slate-400" : "text-red-500")}>
                                {formatMoney(difference, currency)}
                            </div>
                        </div>
                        */}

                        {!isFinalized && (
                            <Button 
                                onClick={handleFinalize}
                                disabled={transactions.filter((t: any) => t.bank_reconciliation_id === reconciliation.id).length === 0}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Finalize
                            </Button>
                        )}
                    </div>
                </div>

                {/* Workbook */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-900/10">
                    <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
                        <div className="rounded-md border bg-white dark:bg-slate-950">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10">
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((trx: any) => {
                                        const isCleared = trx.bank_reconciliation_id === reconciliation.id;
                                        const isDebit = ['deposit', 'transfer_in'].includes(trx.type);
                                        
                                        return (
                                            <TableRow 
                                                key={trx.id} 
                                                className={cn("cursor-pointer transition-colors", isCleared ? "bg-blue-50/50 dark:bg-blue-900/10" : "")}
                                                onClick={() => toggleTransaction(trx.id)}
                                            >
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox 
                                                        checked={isCleared} 
                                                        onCheckedChange={() => toggleTransaction(trx.id)}
                                                        disabled={isFinalized}
                                                    />
                                                </TableCell>
                                                <TableCell>{new Date(trx.transaction_date).toLocaleDateString()}</TableCell>
                                                <TableCell>{trx.description}</TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">{trx.reference || '-'}</TableCell>
                                                <TableCell className={cn("text-right font-medium", isDebit ? "text-emerald-600" : "text-rose-600")}>
                                                    {isDebit ? '+' : '-'} {formatMoney(Number(trx.amount), currency)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isCleared ? (
                                                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Cleared</Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Unreconciled</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {transactions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No transactions available for this period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
