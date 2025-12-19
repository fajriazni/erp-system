import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Calendar, FileCheck, CheckCircle2, User, Building2, ArrowLeft } from 'lucide-react';

interface Props {
    audit: {
        id: number;
        vendor: { name: string; email: string };
        auditor: { name: string };
        audit_type: string;
        audit_date: string;
        status: string;
        score: number | null;
        criteria_scores: Record<string, number> | null;
        findings: string | null;
        recommendations: string | null;
        next_audit_date: string | null;
    };
    defaultCriteria: Record<string, { label: string; weight: number }>;
}

export default function AuditShow({ audit, defaultCriteria }: Props) {
    const { data, setData, put, processing, hasErrors, transform } = useForm<{
        status: string;
        criteria_scores: Record<string, number>;
        findings: string;
        recommendations: string;
        next_audit_date: string;
    }>({
        status: audit.status,
        criteria_scores: audit.criteria_scores || 
            Object.keys(defaultCriteria).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
        findings: audit.findings || '',
        recommendations: audit.recommendations || '',
        next_audit_date: audit.next_audit_date || '',
    });

    // Calculate total score based on weights
    const totalScore = Object.entries(data.criteria_scores).reduce((acc, [key, score]) => {
        const weight = defaultCriteria[key]?.weight || 0;
        return acc + ((Number(score) / 100) * weight);
    }, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            score: totalScore,
        }));
        put(`/purchasing/vendors/audits/${audit.id}`, {
            preserveScroll: true,
        });
    };

    const handleStartAudit = () => {
        router.put(`/purchasing/vendors/audits/${audit.id}`, {
            ...data,
            status: 'in_progress'
        }, {
            preserveScroll: true
        });
    };

    const handleComplete = () => {
        transform((data) => ({
            ...data,
            score: totalScore,
            status: 'completed'
        }));
        put(`/purchasing/vendors/audits/${audit.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendor Audits', href: '/purchasing/vendors/audits' },
            { title: `${audit.vendor.name} Audit`, href: '#' },
        ]}>
            <Head title={`Audit - ${audit.vendor.name}`} />

            <div className="container mx-auto space-y-6">
                <PageHeader 
                    title={`Audit Report: ${audit.vendor.name}`}
                    description={`Type: ${audit.audit_type} • Date: ${new Date(audit.audit_date).toLocaleDateString()}`}
                >
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/purchasing/vendors/audits">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Link>
                        </Button>
                        {audit.status === 'scheduled' && (
                            <Button onClick={handleStartAudit}>Start Audit</Button>
                        )}
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar: Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Audit Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                                        {audit.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Vendor</p>
                                        <p className="text-sm text-muted-foreground">{audit.vendor.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Auditor</p>
                                        <p className="text-sm text-muted-foreground">{audit.auditor.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Scheduled Date</p>
                                        <p className="text-sm text-muted-foreground">{new Date(audit.audit_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle>Overall Score</CardTitle>
                                <CardDescription>Calculated based on weighted criteria</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center py-6">
                                <div className="text-5xl font-bold text-primary">
                                    {Math.round(totalScore)}%
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content: Scoring Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assessment Criteria</CardTitle>
                                    <CardDescription>Rate the vendor on each criterion (0-100)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {Object.entries(defaultCriteria).map(([key, config]) => (
                                        <div key={key} className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-base">{config.label} (Weight: {config.weight}%)</Label>
                                                <span className="font-bold text-lg w-12 text-right">
                                                    {data.criteria_scores[key]}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-xs text-muted-foreground w-8">0</span>
                                                <Slider 
                                                    value={[Number(data.criteria_scores[key])]} 
                                                    max={100} 
                                                    step={1}
                                                    onValueChange={(val) => setData('criteria_scores', {
                                                        ...data.criteria_scores,
                                                        [key]: val[0]
                                                    })}
                                                    disabled={audit.status === 'scheduled'}
                                                />
                                                <span className="text-xs text-muted-foreground w-8 text-right">100</span>
                                            </div>
                                            <Separator />
                                        </div>
                                    ))}

                                    <div className="grid gap-4 pt-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="findings">Key Findings & Observations</Label>
                                            <Textarea 
                                                id="findings" 
                                                value={data.findings} 
                                                onChange={(e) => setData('findings', e.target.value)}
                                                placeholder="Enter detailed audit findings..."
                                                className="min-h-[100px]"
                                                disabled={audit.status === 'scheduled'}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="recommendations">Recommendations</Label>
                                            <Textarea 
                                                id="recommendations" 
                                                value={data.recommendations}
                                                onChange={(e) => setData('recommendations', e.target.value)}
                                                placeholder="Enter improvement recommendations..."
                                                disabled={audit.status === 'scheduled'}
                                            />
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="next">Next Audit Date</Label>
                                            <Input 
                                                id="next" 
                                                type="date"
                                                value={data.next_audit_date}
                                                onChange={(e) => setData('next_audit_date', e.target.value)}
                                                disabled={audit.status === 'scheduled'}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t px-6 pt-5">
                                    <div className="text-sm text-muted-foreground">
                                        {audit.status === 'scheduled' && "Start the audit to enable editing."}
                                    </div>
                                    <div className="flex gap-2">
                                        {audit.status === 'in_progress' && (
                                            <>
                                                 <Button type="button" variant="outline">Save Draft</Button>
                                                 <Button 
                                                    type="button" 
                                                    onClick={handleComplete}
                                                    disabled={processing}
                                                 >
                                                    Complete Audit
                                                 </Button>
                                            </>
                                        )}
                                        {audit.status === 'completed' && (
                                             <Button type="submit" disabled={processing}>Update Record</Button>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
