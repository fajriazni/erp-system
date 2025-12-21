import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, X } from 'lucide-react';

interface DebitNote {
    id: number;
    debit_note_number: string;
    vendor: { id: number; name: string };
    date: string;
    status: string;
    total_amount: number;
    applied_amount: number;
    remaining_amount: number;
    reference_number?: string;
    notes?: string;
    purchase_return?: {
        id: number;
        return_number: string;
    };
    applications: Array<{
        id: number;
        vendor_bill: { id: number; bill_number: string };
        amount_applied: number;
        application_date: string;
    }>;
}

interface VendorBill {
    id: number;
    bill_number: string;
    date: string;
    total_amount: number;
}

interface Props {
    debitNote: DebitNote;
    openBills: VendorBill[];
}

export default function Show({ debitNote, openBills }: Props) {
    const { data, setData, post, processing } = useForm({
        vendor_bill_id: '',
        amount: debitNote.remaining_amount,
    });

    const handlePost = () => {
        router.post(`/purchasing/debit-notes/${debitNote.id}/post`, {});
    };

    const handleApply: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/purchasing/debit-notes/${debitNote.id}/apply`);
    };

    const handleVoid = () => {
        const reason = prompt('Enter void reason:');
        if (reason) {
            router.post(`/purchasing/debit-notes/${debitNote.id}/void`, { reason });
        }
    };

    const statusColor =
        debitNote.status === 'posted' ? 'bg-blue-500' :
        debitNote.status === 'applied' ? 'bg-green-500' :
        debitNote.status === 'voided' ? 'bg-red-500' : 'bg-gray-500';

    return (
        <AppLayout>
            <Head title={`Debit Note ${debitNote.debit_note_number}`} />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/purchasing/debit-notes">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {debitNote.debit_note_number}
                            </h1>
                            <p className="text-muted-foreground">
                                Debit Note Details
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {debitNote.status === 'unposted' && (
                            <Button onClick={handlePost}>
                                <Check className="mr-2 h-4w-4" />
                                Post
                            </Button>
                        )}
                        {debitNote.status === 'posted' && debitNote.remaining_amount > 0 && (
                            <Button onClick={handleVoid} variant="destructive">
                                <X className="mr-2 h-4 w-4" />
                                Void
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Vendor</p>
                                <p className="font-medium">{debitNote.vendor.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p>{debitNote.date}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge className={statusColor}>
                                    {debitNote.status.toUpperCase()}
                                </Badge>
                            </div>
                            {debitNote.purchase_return && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Related Return</p>
                                    <Link
                                        href={`/purchasing/returns/${debitNote.purchase_return.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {debitNote.purchase_return.return_number}
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Amounts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-2xl font-bold">
                                    ${Number(debitNote.total_amount).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Applied</p>
                                <p className="font-medium">
                                    ${Number(debitNote.applied_amount).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Remaining</p>
                                <p className="text-xl font-bold text-green-600">
                                    ${Number(debitNote.remaining_amount).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {debitNote.status === 'posted' && openBills.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Apply to Bill</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleApply} className="space-y-4">
                                    <Select
                                        value={data.vendor_bill_id}
                                        onValueChange={(value) =>
                                            setData('vendor_bill_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bill" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {openBills.map((bill) => (
                                                <SelectItem
                                                    key={bill.id}
                                                    value={bill.id.toString()}
                                                >
                                                    {bill.bill_number} - $
                                                    {bill.total_amount}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData('amount', parseFloat(e.target.value))
                                        }
                                        placeholder="Amount"
                                    />
                                    <Button type="submit" disabled={processing} className="w-full">
                                        Apply
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {debitNote.applications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Application History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Bill Number</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {debitNote.applications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>{app.application_date}</TableCell>
                                            <TableCell>
                                                {app.vendor_bill.bill_number}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${Number(app.amount_applied).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
