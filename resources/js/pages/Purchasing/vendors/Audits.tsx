import { Head, Link, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, Calendar, Loader, CheckCircle2, Award, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface VendorAudit {
    id: number;
    vendor: {
        id: number;
        name: string;
    };
    audit_type: string;
    audit_date: string;
    auditor: {
        name: string;
    };
    score: number | null;
    status: string;
    next_audit_date: string | null;
}

interface Props {
    audits: {
        data: VendorAudit[];
        links: any[];
    };
    stats: {
        scheduled: number;
        in_progress: number;
        completed: number;
        avg_score: number;
    };
    vendors: Array<{ id: number; name: string }>;
    auditors: Array<{ id: number; name: string }>;
}

export default function Audits({ audits, stats, vendors, auditors }: Props) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        vendor_id: '',
        audit_type: 'periodic',
        audit_date: new Date().toISOString().split('T')[0],
        auditor_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/purchasing/vendors/audits', {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: any; icon: any; className?: string }> = {
            scheduled: { label: 'Scheduled', variant: 'secondary' as const, icon: Calendar },
            in_progress: { label: 'In Progress', variant: 'default' as const, icon: Loader, className: 'bg-blue-600' },
            completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-600' },
        };

        const config = statusMap[status] || statusMap.scheduled;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getAuditTypeBadge = (type: string) => {
        const types: Record<string, string> = {
            initial: 'Initial',
            periodic: 'Periodic',
            quality: 'Quality',
            compliance: 'Compliance',
        };
        return types[type] || type;
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) return <span className="text-muted-foreground">Pending</span>;
        
        const numScore = Number(score);
        
        if (numScore >= 90) return <Badge className="bg-green-600">{numScore.toFixed(0)}%</Badge>;
        if (numScore >= 75) return <Badge className="bg-blue-600">{numScore.toFixed(0)}%</Badge>;
        if (numScore >= 60) return <Badge variant="secondary">{numScore.toFixed(0)}%</Badge>;
        return <Badge variant="destructive">{numScore.toFixed(0)}%</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendor Audits', href: '#' },
        ]}>
            <Head title="Vendor Qualification & Audits" />

            <div className="container mx-auto space-y-6">
                <PageHeader 
                    title="Vendor Qualification & Audits"
                    description="Track and manage supplier qualification assessments"
                >
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Audit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Schedule New Audit</DialogTitle>
                                <DialogDescription>
                                    Plan a new vendor audit. Select the vendor, type, and assigned auditor.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="vendor">Vendor</Label>
                                    <Select 
                                        value={data.vendor_id} 
                                        onValueChange={(val) => setData('vendor_id', val)}
                                    >
                                        <SelectTrigger id="vendor">
                                            <SelectValue placeholder="Select vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map((vendor) => (
                                                <SelectItem key={vendor.id} value={String(vendor.id)}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.vendor_id && <span className="text-sm text-destructive">{errors.vendor_id}</span>}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Audit Type</Label>
                                    <Select 
                                        value={data.audit_type} 
                                        onValueChange={(val) => setData('audit_type', val)}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="initial">Initial Assessment</SelectItem>
                                            <SelectItem value="periodic">Periodic Review</SelectItem>
                                            <SelectItem value="quality">Quality Audit</SelectItem>
                                            <SelectItem value="compliance">Compliance Check</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.audit_type && <span className="text-sm text-destructive">{errors.audit_type}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date">Scheduled Date</Label>
                                    <Input 
                                        id="date" 
                                        type="date" 
                                        value={data.audit_date}
                                        onChange={(e) => setData('audit_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.audit_date && <span className="text-sm text-destructive">{errors.audit_date}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="auditor">Assigned Auditor</Label>
                                    <Select 
                                        value={data.auditor_id} 
                                        onValueChange={(val) => setData('auditor_id', val)}
                                    >
                                        <SelectTrigger id="auditor">
                                            <SelectValue placeholder="Select auditor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {auditors.map((auditor) => (
                                                <SelectItem key={auditor.id} value={String(auditor.id)}>
                                                    {auditor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.auditor_id && <span className="text-sm text-destructive">{errors.auditor_id}</span>}
                                </div>
                                
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Scheduling...' : 'Schedule Audit'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.scheduled}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Loader className="h-4 w-4" />
                                In Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Avg Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Number(stats.avg_score || 0).toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Schedule & Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {audits.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileCheck className="h-12 w-12 mb-4 opacity-50" />
                                <p>No vendor audits scheduled yet.</p>
                                <p className="text-sm mt-2">Schedule audits to assess supplier qualifications.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Audit Date</TableHead>
                                        <TableHead>Auditor</TableHead>
                                        <TableHead className="text-center">Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Next Audit</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {audits.data.map((audit) => (
                                        <TableRow key={audit.id}>
                                            <TableCell className="font-medium">{audit.vendor.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getAuditTypeBadge(audit.audit_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(audit.audit_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-sm">{audit.auditor.name}</TableCell>
                                            <TableCell className="text-center">
                                                {getScoreBadge(audit.score)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(audit.status)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {audit.next_audit_date 
                                                    ? new Date(audit.next_audit_date).toLocaleDateString()
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/purchasing/vendors/audits/${audit.id}`}>
                                                        Details
                                                    </Link>
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
