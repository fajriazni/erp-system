import React, { FormEvent } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import InputError from '@/components/input-error';

interface Contact {
    id: number;
    name: string;
    type?: string;
    company_name?: string;
}

interface NoteFormData {
    type: string;
    entity_type: string;
    date: string;
    contact_id: number | string;
    reference_type: string;
    reference_id: number | string;
    amount: number | string;
    reason: string;
}

interface Props {
    note?: any;
    contacts: Contact[];
    defaultType?: string;
    defaultEntityType?: string;
    referenceNumber?: string;
}

export default function NoteForm({ note, contacts, defaultType = 'credit', defaultEntityType = 'customer', referenceNumber }: Props) {
    const isEditing = !!note;

    const { data, setData, post, put, processing, errors } = useForm<NoteFormData>({
        type: note?.type || defaultType,
        entity_type: note?.entity_type || defaultEntityType,
        date: note?.date || new Date().toISOString().split('T')[0],
        contact_id: note?.contact_id || '',
        reference_type: note?.reference_type || '',
        reference_id: note?.reference_id || '',
        amount: note?.amount || '',
        reason: note?.reason || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(`Note ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };

        if (isEditing) {
            put(route('accounting.notes.update', note.id), options);
        } else {
            post(route('accounting.notes.store'), options);
        }
    };

    // Filter contacts based on entity_type
    const filteredContacts = contacts.filter(c => {
        if (data.entity_type === 'customer') {
            return !c.type || c.type === 'customer' || c.type === 'both';
        } else {
            return !c.type || c.type === 'vendor' || c.type === 'both';
        }
    });

    return (
        <React.Fragment>
            <PageHeader
                title={isEditing ? `Edit Note ${note.reference_number}` : 'Create New Note'}
                description={isEditing ? 'Update note details.' : 'Create a Credit or Debit note adjustment.'}
            >
                <Button variant="outline" asChild>
                    <Link href={route('accounting.notes.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>
            </PageHeader>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Note Details</CardTitle>
                        <CardDescription>
                            {data.type === 'credit'
                                ? `Credit Notes reduce the amount ${data.entity_type === 'customer' ? 'a Customer owes you (AR)' : 'you owe a Vendor (AP)'}.`
                                : `Debit Notes increase the amount ${data.entity_type === 'customer' ? 'a Customer owes you (AR) for under-invoicing' : 'you owe a Vendor (AP) for additional charges'}.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        {!isEditing && (
                            <>
                                <div className="space-y-3">
                                    <Label>Entity Type</Label>
                                    <RadioGroup
                                        value={data.entity_type}
                                        onValueChange={(val) => setData('entity_type', val)}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2 border p-4 rounded-md w-full cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                                            <RadioGroupItem value="customer" id="customer" />
                                            <Label htmlFor="customer" className="cursor-pointer font-semibold flex-1">Customer</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border p-4 rounded-md w-full cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                                            <RadioGroupItem value="vendor" id="vendor" />
                                            <Label htmlFor="vendor" className="cursor-pointer font-semibold flex-1">Vendor</Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.entity_type} />
                                </div>

                                <div className="space-y-3">
                                    <Label>Note Type</Label>
                                    <RadioGroup
                                        value={data.type}
                                        onValueChange={(val) => setData('type', val)}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2 border p-4 rounded-md w-full cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                                            <RadioGroupItem value="credit" id="credit" />
                                            <Label htmlFor="credit" className="cursor-pointer font-semibold flex-1">Credit Note</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border p-4 rounded-md w-full cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                                            <RadioGroupItem value="debit" id="debit" />
                                            <Label htmlFor="debit" className="cursor-pointer font-semibold flex-1">Debit Note</Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.type} />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                                <InputError message={errors.date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ref_num">Reference Number</Label>
                                <Input
                                    id="ref_num"
                                    value={note?.reference_number || referenceNumber || 'Auto-generated'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact">
                                {data.entity_type === 'customer' ? 'Customer' : 'Vendor'} <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.contact_id ? String(data.contact_id) : ''}
                                onValueChange={(val) => setData('contact_id', parseInt(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${data.entity_type === 'customer' ? 'Customer' : 'Vendor'}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredContacts.map((contact) => (
                                        <SelectItem key={contact.id} value={String(contact.id)}>
                                            {contact.company_name || contact.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.contact_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Total Amount <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">Rp</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="pl-9 font-mono text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                            <InputError message={errors.amount} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason / Description <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder="E.g. Return of damaged goods, Price adjustment, etc."
                                rows={4}
                            />
                            <InputError message={errors.reason} />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between border-t px-6 pt-5">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {processing ? 'Saving...' : (isEditing ? 'Update Note' : 'Create Note')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </React.Fragment>
    );
}
