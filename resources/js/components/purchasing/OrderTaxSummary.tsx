import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import type { TaxCalculationBreakdown } from '@/types/purchasing';

interface OrderTaxSummaryProps {
    breakdown: TaxCalculationBreakdown;
    className?: string;
}

export function OrderTaxSummary({ breakdown, className }: OrderTaxSummaryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: breakdown.currency || 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">
                        Tax Summary
                    </CardTitle>
                </div>
                {breakdown.tax_inclusive && (
                    <CardDescription className="text-xs">
                        Tax-inclusive calculation
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        Subtotal {breakdown.tax_inclusive && '(incl. tax)'}
                    </span>
                    <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
                </div>
                
                {breakdown.tax_rate > 0 && (
                    <>
                        {breakdown.tax_inclusive && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Subtotal (excl. tax)</span>
                                <span>{formatCurrency(breakdown.subtotal_excluding_tax)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Tax ({breakdown.tax_rate}%)
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(breakdown.tax_amount)}
                            </span>
                        </div>
                    </>
                )}
                
                {breakdown.withholding_tax_rate > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Withholding Tax ({breakdown.withholding_tax_rate}%)
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(breakdown.withholding_tax_amount)}
                        </span>
                    </div>
                )}
                
                <div className="border-t pt-2">
                    <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">
                            {formatCurrency(breakdown.net_total)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
