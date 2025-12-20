import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
    status: string;
    className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'draft':
                return {
                    label: 'Draft',
                    variant: 'secondary' as const,
                    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                };
            case 'to_approve':
                return {
                    label: 'Pending Approval',
                    variant: 'default' as const,
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                };
            case 'open':
                return {
                    label: 'Open',
                    variant: 'default' as const,
                    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                };
            case 'partially_received':
                return {
                    label: 'Partially Received',
                    variant: 'default' as const,
                    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                };
            case 'closed':
                return {
                    label: 'Closed',
                    variant: 'default' as const,
                    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    variant: 'destructive' as const,
                    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                };
            default:
                return {
                    label: status,
                    variant: 'secondary' as const,
                    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge 
            variant={config.variant}
            className={cn(config.className, className)}
        >
            {config.label}
        </Badge>
    );
}
