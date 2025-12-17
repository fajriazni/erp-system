import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Props {
    status: string;
    exceptions?: Array<{
        type: string;
        product_name?: string;
        message: string;
    }>;
}

export default function MatchStatusBadge({ status, exceptions }: Props) {
    const getStatusConfig = () => {
        switch (status) {
            case 'matched':
                return {
                    variant: 'default' as const,
                    icon: <CheckCircle className="h-3 w-3 mr-1" />,
                    label: 'Matched',
                    className: 'bg-green-500 hover:bg-green-600',
                };
            case 'exception':
                return {
                    variant: 'destructive' as const,
                    icon: <AlertTriangle className="h-3 w-3 mr-1" />,
                    label: `Exception (${exceptions?.length || 0})`,
                    className: '',
                };
            default:
                return {
                    variant: 'secondary' as const,
                    icon: <Clock className="h-3 w-3 mr-1" />,
                    label: 'Pending',
                    className: '',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Badge variant={config.variant} className={`flex items-center ${config.className}`}>
            {config.icon}
            {config.label}
        </Badge>
    );
}
