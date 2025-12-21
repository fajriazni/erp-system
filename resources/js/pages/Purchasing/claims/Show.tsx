import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface VendorClaim {
    id: number;
    claim_number: string;
    vendor: { id: number; name: string };
    purchase_order?: { id: number; document_number: string };
    goods_receipt?: { id: number; receipt_number: string };
    claim_type: string;
    claim_date: string;
    claim_amount: number;
    status: string;
    description: string;
    evidence_attachments?: string[];
    vendor_response?: string;
    settlement_type?: string;
    settlement_amount?: number;
    settlement_date?: string;
}

interface Props {
    claim: VendorClaim;
}

export default function Show({ claim }: Props) {
    const [settlementData, setSettlementData] = useState({
        settlement_type: 'credit_note',
        settlement_amount: claim.claim_amount,
    });

    const handleReview = () => {
        router.post(`/purchasing/claims/${claim.id}/review`, {});
    };

    const handleApprove = () => {
        router.post(`/purchasing/claims/${claim.id}/approve`, {});
    };

    const handleDispute = () => {
        const reason = prompt('Enter dispute reason:');
        if (reason) {
            router.post(`/purchasing/claims/${claim.id}/dispute`, { reason });
        }
    };

    const handleSettle = () => {
        router.post(`/purchasing/claims/${claim.id}/settle`, settlementData);
    };

    const handleReject = () => {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
            router.post(`/purchasing/claims/${claim.id}/reject`, { reason });
        }
    };

    const statusColor =
        claim.status === 'submitted' ? 'bg-blue-500' :
        claim.status === 'under_review' ? 'bg-yellow-500' :
        claim.status === 'approved' ? 'bg-green-500' :
        claim.status === 'settled' ? 'bg-green-700' :
        claim.status === 'disputed' ? 'bg-orange-500' : 'bg-red-500';

    return (
        <AppLayout>
            <Head title={`Claim ${claim.claim_number}`} />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/purchasing/claims">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">{claim.claim_number}</h1>
                            <p className="text-muted-foreground">Vendor Claim Details</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {claim.status === 'submitted' && (
                            <>
                                <Button onClick={handleReview} variant="outline">
                                    Review
                                </Button>
                                <Button onClick={handleReject} variant="destructive">
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                            </>
                        )}
                        {(claim.status === 'submitted' || claim.status === 'under_review') && (
                            <Button onClick={handleApprove}>
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        )}
                        {claim.status === 'under_review' && (
                            <Button onClick={handleDispute} variant="outline">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Dispute
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Vendor</p>
                                <p className="font-medium">{claim.vendor.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Claim Date</p>
                                <p>{claim.claim_date}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Type</p>
                                <Badge variant="outline">
                                    {claim.claim_type.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge className={statusColor}>
                                    {claim.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            {claim.purchase_order && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Related PO
                                    </p>
                                    <Link
                                        href={`/purchasing/orders/${claim.purchase_order.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {claim.purchase_order.document_number}
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Amount Claimed
                                </p>
                                <p className="text-3xl font-bold">
                                    ${Number(claim.claim_amount).toLocaleString()}
                                </p>
                            </div>
                            {claim.settlement_amount && (
                                <div className="mt-4 pt-4 border-t text-center">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Settled Amount
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${Number(claim.settlement_amount).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {claim.status === 'approved' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Settlement</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Settlement Type</Label>
                                    <Select
                                        value={settlementData.settlement_type}
                                        onValueChange={(value) =>
                                            setSettlementData({
                                                ...settlementData,
                                                settlement_type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="replacement">
                                                Replacement
                                            </SelectItem>
                                            <SelectItem value="refund">
                                                Refund
                                            </SelectItem>
                                            <SelectItem value="credit_note">
                                                Credit Note
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={settlementData.settlement_amount}
                                        onChange={(e) =>
                                            setSettlementData({
                                                ...settlementData,
                                                settlement_amount: parseFloat(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <Button onClick={handleSettle} className="w-full">
                                    Settle Claim
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{claim.description}</p>
                    </CardContent>
                </Card>

                {claim.evidence_attachments && claim.evidence_attachments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Evidence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                                {claim.evidence_attachments.map((file, index) => (
                                    <div
                                        key={index}
                                        className="border rounded p-2 text-center"
                                    >
                                        <p className="text-sm truncate">{file}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {claim.vendor_response && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Response</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{claim.vendor_response}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
