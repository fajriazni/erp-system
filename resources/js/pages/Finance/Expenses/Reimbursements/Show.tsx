import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Added router as fallback if needed for simple visits
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Send, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExpenseClaim {
    id: number;
    title: string;
    description: string;
    total_amount: string;
    status: string;
    department?: { name: string; code: string };
    user?: { name: string };
    items: {
        id: number;
        date: string;
        category: string;
        description: string;
        amount: string;
    }[];
    rejection_reason?: string;
}

interface Props {
    claim: ExpenseClaim;
    can_approve: boolean;
}

export default function ExpenseShow({ claim, can_approve }: Props) {
    const { post, processing } = useForm();
    const [rejectReason, setRejectReason] = React.useState('');
    const [isRejectOpen, setIsRejectOpen] = React.useState(false);

    const handleSubmit = () => {
        if (confirm('Are you sure you want to submit this claim for approval?')) {
            post(`/finance/expenses/reimbursements/${claim.id}/submit`);
        }
    };

    const handleApprove = () => {
        if (confirm('Are you sure you want to approve this claim?')) {
            post(`/finance/expenses/reimbursements/${claim.id}/approve`);
        }
    };

    const handleReject = () => {
        router.post(`/finance/expenses/reimbursements/${claim.id}/reject`, {
            reason: rejectReason
        });
        setIsRejectOpen(false);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/accounting' },
            { title: 'Reimbursements', href: '/finance/expenses/reimbursements' },
            { title: claim.title }
        ]}>
            <Head title={`Claim: ${claim.title}`} />
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link href="/finance/expenses/reimbursements">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        {claim.status === 'draft' && (
                            <Button onClick={handleSubmit} disabled={processing}>
                                <Send className="mr-2 h-4 w-4" /> Submit for Approval
                            </Button>
                        )}

                        {can_approve && claim.status === 'submitted' && (
                            <>
                                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reject Expense Claim</DialogTitle>
                                            <DialogDescription>
                                                Please provide a reason for rejecting this claim.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <Label htmlFor="reason">Reason</Label>
                                            <Textarea
                                                id="reason"
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                                            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>Reject Claim</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={processing}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </Button>
                            </>
                        )}
                        
                        {claim.status === 'approved' && (
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                                if(confirm('Process payment for this claim?')) post(`/finance/expenses/reimbursements/${claim.id}/pay`)
                            }} disabled={processing}>
                                <CreditCard className="mr-2 h-4 w-4" /> Pay
                            </Button>
                        )}
                    </div>
                </div>

                {claim.status === 'rejected' && claim.rejection_reason && (
                    <Alert variant="destructive">
                        <AlertTitle>Claim Rejected</AlertTitle>
                        <AlertDescription>
                            Reason: {claim.rejection_reason}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Expense Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {claim.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right">
                                                Rp {parseFloat(item.amount).toLocaleString('id-ID')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold text-lg">
                                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                                        <TableCell className="text-right">
                                            Rp {parseFloat(claim.total_amount).toLocaleString('id-ID')}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Claim Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <div className="mt-1">
                                        <Badge variant={claim.status === 'approved' ? 'default' : (claim.status === 'rejected' ? 'destructive' : 'secondary')}>
                                            {claim.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Employee</span>
                                    <p className="font-medium">{claim.user?.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Department</span>
                                    <p className="font-medium">[{claim.department?.code}] {claim.department?.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Description</span>
                                    <p className="text-sm">{claim.description || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
