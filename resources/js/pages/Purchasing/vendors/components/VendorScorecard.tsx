import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown, Clock, Package, RotateCcw } from 'lucide-react';

interface Props {
    vendor: {
        id: number;
        name: string;
        rating_score: number | null;
        on_time_rate: number | null;
        quality_rate: number | null;
        return_rate: number | null;
        last_score_update: string | null;
    };
}

const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5">
            {Array(fullStars).fill(null).map((_, i) => (
                <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            {hasHalf && (
                <div className="relative">
                    <Star className="h-5 w-5 text-gray-300" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                </div>
            )}
            {Array(emptyStars).fill(null).map((_, i) => (
                <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
            ))}
        </div>
    );
};

const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    suffix = '%',
    colorClass = 'text-gray-900',
    trend
}: { 
    icon: React.ElementType; 
    label: string; 
    value: number | null; 
    suffix?: string;
    colorClass?: string;
    trend?: 'up' | 'down';
}) => (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
        <div className="p-2 rounded-full bg-background">
            <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground text-center">{label}</p>
        <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${colorClass}`}>
                {value !== null ? `${Number(value).toFixed(1)}${suffix}` : 'N/A'}
            </p>
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
        </div>
    </div>
);

export default function VendorScorecard({ vendor }: Props) {
    const hasData = vendor.rating_score !== null || 
                    vendor.on_time_rate !== null || 
                    vendor.quality_rate !== null;

    const getRatingLabel = (rating: number | null): string => {
        if (rating === null) return 'No Rating';
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 4.0) return 'Very Good';
        if (rating >= 3.0) return 'Good';
        if (rating >= 2.0) return 'Fair';
        return 'Poor';
    };

    const getRatingColor = (rating: number | null): string => {
        if (rating === null) return 'bg-gray-100 text-gray-800';
        if (rating >= 4.0) return 'bg-green-100 text-green-800';
        if (rating >= 3.0) return 'bg-yellow-100 text-yellow-800';
        if (rating >= 2.0) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Quality Scorecard</CardTitle>
                        <CardDescription>Performance metrics for {vendor.name}</CardDescription>
                    </div>
                    {vendor.rating_score !== null && (
                        <Badge className={getRatingColor(vendor.rating_score)}>
                            {getRatingLabel(vendor.rating_score)}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!hasData ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No performance data available yet.</p>
                        <p className="text-sm">Data will be collected from future transactions.</p>
                    </div>
                ) : (
                    <>
                        {/* Star Rating */}
                        {vendor.rating_score !== null && (
                            <div className="flex items-center justify-center gap-3 py-4 border-b">
                                <StarRating rating={Number(vendor.rating_score)} />
                                <span className="text-2xl font-bold">{Number(vendor.rating_score).toFixed(2)}</span>
                            </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            <MetricCard 
                                icon={Clock}
                                label="On-Time"
                                value={vendor.on_time_rate}
                                colorClass={vendor.on_time_rate && vendor.on_time_rate >= 80 ? 'text-green-600' : 'text-orange-600'}
                            />
                            <MetricCard 
                                icon={Package}
                                label="Quality"
                                value={vendor.quality_rate}
                                colorClass={vendor.quality_rate && vendor.quality_rate >= 90 ? 'text-green-600' : 'text-orange-600'}
                            />
                            <MetricCard 
                                icon={RotateCcw}
                                label="Returns"
                                value={vendor.return_rate}
                                colorClass={vendor.return_rate && vendor.return_rate <= 5 ? 'text-green-600' : 'text-red-600'}
                            />
                        </div>

                        {/* Last Updated */}
                        {vendor.last_score_update && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                Last updated: {new Date(vendor.last_score_update).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
