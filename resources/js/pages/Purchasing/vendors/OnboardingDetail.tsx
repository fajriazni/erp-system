import { Head, Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
    ArrowLeft, CheckCircle2, XCircle, FileText, Building2, 
    Mail, Phone, MapPin, Calendar, User, Send 
} from 'lucide-react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

interface Vendor {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    tax_id: string | null;
    website: string | null;
    status: string;
    company_registration_no: string | null;
    established_year: number | null;
    employee_count: number | null;
    category: string | null;
    industry: string | null;
    payment_term?: {
        name: string;
    };
}

interface ChecklistItem {
    label: string;
    completed: boolean;
}

interface Document {
    type: string;
    name: string;
    url: string;
}

interface VendorOnboarding {
    id: number;
    vendor_id: number;
    status: string;
    checklist: Record<string, ChecklistItem>;
    documents: Document[];
    notes: string | null;
    reviewed_by: number | null;
    reviewer?: {
        name: string;
    };
    reviewed_at: string | null;
    approved_at: string | null;
    created_at: string;
}

interface Props {
    vendor: Vendor;
    onboarding: VendorOnboarding;
}

export default function OnboardingDetail({ vendor, onboarding }: Props) {
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: any; className?: string }> = {
            pending: { label: 'Pending', variant: 'secondary' as const },
            in_review: { label: 'In Review', variant: 'default' as const },
            approved: { label: 'Approved', variant: 'default' as const, className: 'bg-green-600' },
            rejected: { label: 'Rejected', variant: 'destructive' as const },
        };

        const config = statusMap[status] || statusMap.pending;
        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    };

    const handleChecklistToggle = (itemKey: string, completed: boolean) => {
        router.post(`/purchasing/vendors/onboarding/${onboarding.id}/checklist`, {
            item: itemKey,
            completed: completed,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Checklist updated'),
            onError: () => toast.error('Failed to update checklist'),
        });
    };

    const confirmSubmitForReview = () => {
        setProcessing(true);
        router.post(`/purchasing/vendors/onboarding/${onboarding.id}/submit`, {}, {
            onSuccess: () => {
                toast.success('Submitted for review successfully');
                setProcessing(false);
                setShowSubmitDialog(false);
            },
            onError: (errors) => {
                toast.error(errors.checklist || 'Failed to submit for review');
                setProcessing(false);
                setShowSubmitDialog(false);
            },
        });
    };

    const confirmApprove = () => {
        setProcessing(true);
        router.post(`/purchasing/vendors/onboarding/${onboarding.id}/approve`, {
            notes: notes,
        }, {
            onSuccess: () => {
                toast.success('Vendor approved and activated');
                setProcessing(false);
                setShowApproveDialog(false);
            },
            onError: () => {
                toast.error('Failed to approve vendor');
                setProcessing(false);
                setShowApproveDialog(false);
            },
        });
    };

    const confirmReject = () => {
        if (!notes.trim()) {
            toast.error('Please provide rejection reason in notes');
            return;
        }

        setProcessing(true);
        router.post(`/purchasing/vendors/onboarding/${onboarding.id}/reject`, {
            notes: notes,
        }, {
            onSuccess: () => {
                toast.success('Vendor onboarding rejected');
                setProcessing(false);
                setShowRejectDialog(false);
            },
            onError: () => {
                toast.error('Failed to reject vendor');
                setProcessing(false);
                setShowRejectDialog(false);
            },
        });
    };

    const checklistItems = Object.entries(onboarding.checklist || {});
    const completedCount = checklistItems.filter(([_, item]) => item.completed).length;
    const totalCount = checklistItems.length;
    const allCompleted = completedCount === totalCount;

    const canEdit = onboarding.status === 'pending';
    const canReview = onboarding.status === 'in_review';
    const isFinalized = ['approved', 'rejected'].includes(onboarding.status);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendor Onboarding', href: '/purchasing/vendors/onboarding' },
            { title: vendor.name, href: '#' },
        ]}>
            <Head title={`Onboarding - ${vendor.name}`} />

            <div className="space-y-6">
                <PageHeader 
                    title={`Vendor Onboarding: ${vendor.name}`}
                    description="Review and approve vendor qualification"
                >
                    <Button variant="outline" asChild>
                        <Link href="/purchasing/vendors/onboarding">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to List
                        </Link>
                    </Button>
                </PageHeader>

                {/* Status & Progress */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-bold">Onboarding Status</h3>
                                    {getStatusBadge(onboarding.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Created {new Date(onboarding.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">{completedCount}/{totalCount}</div>
                                <p className="text-sm text-muted-foreground">Checklist Items</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Vendor Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Vendor Profile */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Vendor Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="text-sm">{vendor.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <p className="text-sm">{vendor.phone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Address</p>
                                            <p className="text-sm">{vendor.address || '-'}</p>
                                        </div>
                                    </div>
                                    {vendor.tax_id && (
                                        <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground">Tax ID</p>
                                                <p className="text-sm font-mono">{vendor.tax_id}</p>
                                            </div>
                                        </div>
                                    )}
                                    {vendor.established_year && (
                                        <div className="flex items-start gap-2">
                                            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground">Established</p>
                                                <p className="text-sm">{vendor.established_year}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Documents ({onboarding.documents?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {onboarding.documents && onboarding.documents.length > 0 ? (
                                    <div className="space-y-2">
                                        {onboarding.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border rounded hover:bg-accent">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{doc.name}</p>
                                                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => window.open(doc.url, '_blank')}>
                                                    View
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No documents uploaded yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Checklist & Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Checklist */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Onboarding Checklist</CardTitle>
                                <CardDescription>
                                    Complete all items before submitting for review
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {checklistItems.map(([key, item]) => (
                                    <div key={key} className="flex items-start gap-3 p-3 border rounded hover:bg-accent transition-colors">
                                        <Checkbox 
                                            id={key}
                                            checked={item.completed}
                                            onCheckedChange={(checked) => handleChecklistToggle(key, checked as boolean)}
                                            disabled={!canEdit}
                                        />
                                        <div className="flex-1">
                                            <Label 
                                                htmlFor={key}
                                                className={`cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                                            >
                                                {item.label}
                                            </Label>
                                        </div>
                                        {item.completed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Review Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Notes */}
                                {(canReview || onboarding.notes) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            {canReview ? 'Review Notes' : 'Notes'}
                                            {canReview && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        <Textarea 
                                            id="notes"
                                            value={notes || onboarding.notes || ''}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder={canReview ? "Enter approval/rejection notes..." : "No notes"}
                                            rows={4}
                                            disabled={!canReview}
                                        />
                                    </div>
                                )}

                                {/* Status-specific actions */}
                                <div className="flex gap-3">
                                    {canEdit && (
                                        <Button 
                                            onClick={() => setShowSubmitDialog(true)}
                                            disabled={!allCompleted || processing}
                                            className="flex-1"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit for Review
                                        </Button>
                                    )}

                                    {canReview && (
                                        <>
                                            <Button 
                                                onClick={() => setShowApproveDialog(true)}
                                                disabled={processing}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button 
                                                onClick={() => setShowRejectDialog(true)}
                                                disabled={processing}
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {isFinalized && onboarding.reviewer && (
                                    <div className="pt-4 border-t space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Reviewed by:</span>
                                            <span className="font-medium">{onboarding.reviewer.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">On:</span>
                                            <span>{new Date(onboarding.reviewed_at!).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Submit for Review Dialog */}
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit for Review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will submit the vendor onboarding for review. You won't be able to make changes after submission. The checklist must be complete before continuing.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSubmitForReview} disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit for Review'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Vendor Onboarding?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will activate the vendor and allow them to receive purchase orders. Make sure all documents and information have been verified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmApprove} 
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? 'Approving...' : 'Approve Vendor'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Vendor Onboarding?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reject the vendor onboarding. The vendor will need to fix issues and resubmit. Make sure you have provided clear rejection notes explaining what needs to be corrected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmReject} 
                            disabled={processing || !notes.trim()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing ? 'Rejecting...' : 'Reject Onboarding'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
