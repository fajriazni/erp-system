import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown, Award, PackageCheck, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Vendor {
    id: number;
    name: string;
    rating_score: number | null;
    on_time_rate: number | null;
    quality_rate: number | null;
    return_rate: number | null;
    last_score_update: string | null;
}

interface Props {
    vendors: {
        data: Vendor[];
        links: any[];
    };
}

export default function Scorecards({ vendors }: Props) {
    const getStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
            } else if (i === fullStars && hasHalf) {
                stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
            } else {
                stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
            }
        }
        return stars;
    };

    const getPerformanceBadge = (rate: number, type: 'normal' | 'inverse' = 'normal') => {
        // For normal metrics (higher is better): on-time, quality
        // For inverse metrics (lower is better): return rate
        const threshold = type === 'normal' 
            ? { excellent: 95, good: 80, warning: 60 }
            : { excellent: 5, good: 10, warning: 20 };

        if (type === 'normal') {
            if (rate >= threshold.excellent) return <Badge variant="default" className="bg-green-600">Excellent</Badge>;
            if (rate >= threshold.good) return <Badge variant="default" className="bg-blue-600">Good</Badge>;
            if (rate >= threshold.warning) return <Badge variant="secondary">Fair</Badge>;
            return <Badge variant="destructive">Poor</Badge>;
        } else {
            if (rate <= threshold.excellent) return <Badge variant="default" className="bg-green-600">Excellent</Badge>;
            if (rate <= threshold.good) return <Badge variant="default" className="bg-blue-600">Good</Badge>;
            if (rate <= threshold.warning) return <Badge variant="secondary">Fair</Badge>;
            return <Badge variant="destructive">Poor</Badge>;
        }
    };

    const ratedVendors = vendors.data.filter(v => v.rating_score !== null);
    const avgRating = ratedVendors.length > 0
        ? ratedVendors.reduce((sum, v) => sum + Number(v.rating_score), 0) / ratedVendors.length
        : 0;

    const excellentVendors = vendors.data.filter(v => (v.rating_score ?? 0) >= 4.5).length;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Supplier Scorecards', href: '#' },
        ]}>
            <Head title="Supplier Scorecards" />

            <div className="container mx-auto space-y-6">
                <PageHeader 
                    title="Supplier Scorecards"
                    description="Monitor and analyze supplier performance metrics"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{avgRating.toFixed(2)}</span>
                                <div className="flex gap-0.5">
                                    {getStars(avgRating)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rated Vendors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{vendors.data.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">With performance data</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Excellent Suppliers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{excellentVendors}</div>
                            <p className="text-xs text-muted-foreground mt-1">⭐ 4.5+ rating</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Performance Rankings</CardTitle>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input placeholder="Search vendors..." className="h-9" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {vendors.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Award className="h-12 w-12 mb-4 opacity-50" />
                                <p>No vendor performance data available yet.</p>
                                <p className="text-sm mt-2">Scores will appear after receiving orders and conducting QC.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Vendor Name</TableHead>
                                        <TableHead className="text-center">Rating</TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                On-Time %
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <PackageCheck className="h-3 w-3" />
                                                Quality %
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <RotateCcw className="h-3 w-3" />
                                                Return %
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendors.data.map((vendor, index) => (
                                        <TableRow key={vendor.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{vendor.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Updated: {vendor.last_score_update ? new Date(vendor.last_score_update).toLocaleDateString() : 'Never'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-bold text-lg">{Number(vendor.rating_score ?? 0).toFixed(1)}</span>
                                                    <div className="flex gap-0.5">
                                                        {getStars(Number(vendor.rating_score ?? 0))}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="font-medium">{Number(vendor.on_time_rate ?? 0).toFixed(1)}%</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="font-medium">{Number(vendor.quality_rate ?? 0).toFixed(1)}%</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="font-medium">{Number(vendor.return_rate ?? 0).toFixed(1)}%</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(vendor.rating_score ?? 0) >= 4.5 ? (
                                                    getPerformanceBadge((vendor.rating_score ?? 0) * 20, 'normal')
                                                ) : (vendor.rating_score ?? 0) >= 3.5 ? (
                                                    <Badge variant="default" className="bg-blue-600">Good</Badge>
                                                ) : (vendor.rating_score ?? 0) >= 2.5 ? (
                                                    <Badge variant="secondary">Fair</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Needs Improvement</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/purchasing/vendors/${vendor.id}`}>Details</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
