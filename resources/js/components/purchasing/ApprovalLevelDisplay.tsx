import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, User, Building, DollarSign } from 'lucide-react';

interface ApprovalLevelDisplayProps {
    total: number;
    level?: number;
    description?: string;
}

export function ApprovalLevelDisplay({ total, level, description }: ApprovalLevelDisplayProps) {
    const getApprovalLevel = (amount: number): number => {
        if (amount <= 10_000_000) return 1;
        if (amount <= 50_000_000) return 2;
        if (amount <= 100_000_000) return 3;
        return 4;
    };

    const getApprovalConfig = (level: number) => {
        switch (level) {
            case 1:
                return {
                    label: 'Level 1: Supervisor',
                    description: 'Single approval ≤10M',
                    icon: User,
                    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
                    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                };
            case 2:
                return {
                    label: 'Level 2: Manager',
                    description: 'Two-level approval 10M-50M',
                    icon: User,
                    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
                    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                };
            case 3:
                return {
                    label: 'Level 3: Finance',
                    description: 'Three-level approval 50M-100M',
                    icon: Building,
                    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
                    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                };
            case 4:
                return {
                    label: 'Level 4: CEO',
                    description: 'Four-level approval >100M',
                    icon: ShieldCheck,
                    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
                    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                };
            default:
                return {
                    label: 'Unknown',
                    description: 'Level not determined',
                    icon: User,
                    color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
                    badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                };
        }
    };

    const currentLevel = level ?? getApprovalLevel(total);
    const config = getApprovalConfig(currentLevel);
    const Icon = config.icon;

    return (
        <Card className="border-muted">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium">
                                Approval Required
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {description || config.description}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge className={config.badgeColor}>
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Total: {new Intl.NumberFormat('id-ID', { 
                        style: 'currency', 
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(total)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
