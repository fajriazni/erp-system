import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Add router import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Plus, Gavel, CheckCircle } from 'lucide-react';
import { index, invite, bid, award } from '@/routes/purchasing/rfqs'; // Ensure these routes exist in TS helper or use route() helper if generated
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Helper for route generation if TS helper is not perfect
const route = (window as any).route;

export default function Show({ rfq, vendors, products }: { rfq: any, vendors: any[], products: any[] }) {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [bidOpen, setBidOpen] = useState(false);

    // Invite Form
    const { data: inviteData, setData: setInviteData, post: postInvite, processing: inviteProcessing, reset: resetInvite } = useForm({
        vendor_ids: [] as string[],
    });

    // Bid Form
    const { data: bidData, setData: setBidData, post: postBid, processing: bidProcessing, reset: resetBid, errors: bidErrors } = useForm({
        vendor_id: '',
        reference_number: '',
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: '',
        currency: 'IDR',
        notes: '',
        items: rfq.lines.map((line: any) => ({
            product_id: line.product_id.toString(),
            quantity: line.quantity,
            unit_price: '',
            notes: ''
        }))
    });

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postInvite(route('purchasing.rfqs.invite', { rfq: rfq.id }), {
            onSuccess: () => {
                setInviteOpen(false);
                resetInvite();
            }
        });
    };

    const handleBidSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postBid(route('purchasing.rfqs.bid', { rfq: rfq.id }), {
             onSuccess: () => {
                setBidOpen(false);
                resetBid();
            }
        });
    };

    const handleAward = (quotationId: number) => {
        if (confirm('Are you sure you want to award this quotation? This will close the RFQ and create a Draft PO.')) {
            router.post(route('purchasing.quotations.award', { quotation: quotationId }));
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'RFQs', href: index.url() },
            { title: rfq.document_number }
        ]}>
            <Head title={`RFQ ${rfq.document_number}`} />
            
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{rfq.document_number}: {rfq.title}</h1>
                            <div className="flex gap-2 items-center text-sm text-muted-foreground">
                                <Badge variant={rfq.status === 'open' ? 'default' : 'secondary'}>{rfq.status.toUpperCase()}</Badge>
                                <span>Deadline: {new Date(rfq.deadline).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Overview & Items */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requested Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="py-2">Product</th>
                                            <th className="py-2">Qty</th>
                                            <th className="py-2">Target Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rfq.lines.map((line: any) => (
                                            <tr key={line.id} className="border-b last:border-0">
                                                <td className="py-2">
                                                    <div className="font-medium">{line.product.name}</div>
                                                    <div className="text-xs text-muted-foreground">{line.product.code}</div>
                                                </td>
                                                <td className="py-2">{line.quantity} {line.uom}</td>
                                                <td className="py-2">{line.target_price ? new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(line.target_price) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="bids">
                            <TabsList>
                                <TabsTrigger value="bids">Bids Received</TabsTrigger>
                                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                            </TabsList>
                            <TabsContent value="bids">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Vendor Quotations</CardTitle>
                                        {rfq.status === 'open' && (
                                              <Dialog open={bidOpen} onOpenChange={setBidOpen}>
                                              <DialogTrigger asChild>
                                                  <Button size="sm"><Gavel className="mr-2 h-4 w-4" /> Record Bid</Button>
                                              </DialogTrigger>
                                              <DialogContent className="max-w-3xl">
                                                  <DialogHeader>
                                                      <DialogTitle>Record Vendor Bid (Manual)</DialogTitle>
                                                      <DialogDescription>Enter the details of the quotation received from vendor.</DialogDescription>
                                                  </DialogHeader>
                                                  <form onSubmit={handleBidSubmit}>
                                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                                          <div className="space-y-2">
                                                              <Label>Vendor</Label>
                                                              <Select value={bidData.vendor_id} onValueChange={(val) => setBidData('vendor_id', val)}>
                                                                  <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                                                  <SelectContent>
                                                                      {vendors.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>)}
                                                                  </SelectContent>
                                                              </Select>
                                                              {bidErrors.vendor_id && <p className="text-red-500 text-xs">{bidErrors.vendor_id}</p>}
                                                          </div>
                                                          <div className="space-y-2">
                                                              <Label>Reference #</Label>
                                                              <Input value={bidData.reference_number} onChange={e => setBidData('reference_number', e.target.value)} />
                                                          </div>
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                                          <div className="space-y-2">
                                                              <Label>Quote Date</Label>
                                                              <Input type="date" value={bidData.quote_date} onChange={e => setBidData('quote_date', e.target.value)} />
                                                              {bidErrors.quote_date && <p className="text-red-500 text-xs">{bidErrors.quote_date}</p>}
                                                          </div>
                                                          <div className="space-y-2">
                                                              <Label>Currency</Label>
                                                              <Select value={bidData.currency} onValueChange={(val) => setBidData('currency', val)}>
                                                                  <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                                                                  <SelectContent>
                                                                      <SelectItem value="IDR">IDR</SelectItem>
                                                                      <SelectItem value="USD">USD</SelectItem>
                                                                  </SelectContent>
                                                              </Select>
                                                              {bidErrors.currency && <p className="text-red-500 text-xs">{bidErrors.currency}</p>}
                                                          </div>
                                                      </div>
                                                      <div className="mb-4">
                                                            <Label>Notes</Label>
                                                            <Input value={bidData.notes} onChange={e => setBidData('notes', e.target.value)} placeholder="Optional remarks..." />
                                                      </div>
                                                      
                                                      <div className="space-y-4 mb-4 border p-4 rounded bg-muted/30 max-h-[300px] overflow-y-auto">
                                                          <h4 className="font-medium text-sm">Item Pricing</h4>
                                                          {bidData.items.map((item: any, idx: number) => (
                                                              <div key={idx} className="grid grid-cols-12 gap-2 items-end border-b pb-2">
                                                                  <div className="col-span-6">
                                                                      <Label className="text-xs">{rfq.lines[idx].product.name}</Label>
                                                                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                                                                  </div>
                                                                  <div className="col-span-6">
                                                                      <Label className="text-xs">Unit Price</Label>
                                                                      <Input 
                                                                          type="number" 
                                                                          value={item.unit_price} 
                                                                          onChange={e => {
                                                                              const newItems = [...bidData.items];
                                                                              newItems[idx].unit_price = e.target.value;
                                                                              setBidData('items', newItems);
                                                                          }}
                                                                      />
                                                                  </div>
                                                              </div>
                                                          ))}
                                                      </div>

                                                      <DialogFooter>
                                                          <Button type="submit" disabled={bidProcessing}>Save Quotation</Button>
                                                      </DialogFooter>
                                                  </form>
                                              </DialogContent>
                                          </Dialog>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {rfq.quotations.length === 0 ? (
                                            <p className="text-muted-foreground text-sm">No bids received yet.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {rfq.quotations.map((quote: any) => (
                                                    <div key={quote.id} className="border p-4 rounded-lg flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold">{quote.vendor.name}</div>
                                                            <div className="text-sm">Ref: {quote.reference_number || '-'}</div>
                                                            <div className="text-sm font-medium text-emerald-600">
                                                                {new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(quote.total_amount)}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            {quote.status === 'won' && <Badge className="bg-green-500">AWARDED</Badge>}
                                                            {quote.status === 'submitted' && rfq.status === 'open' && (
                                                                <Button size="sm" variant="outline" onClick={() => handleAward(quote.id)}>
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Award
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="comparison">
                                <Card>
                                    <CardContent className="pt-6 overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="border p-2 bg-muted">Product</th>
                                                    <th className="border p-2 bg-muted">Target</th>
                                                    {rfq.quotations.map((q: any) => (
                                                        <th key={q.id} className={`border p-2 ${q.status === 'won' ? 'bg-green-100 dark:bg-green-900' : ''}`}>
                                                            {q.vendor.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rfq.lines.map((line: any, idx: number) => (
                                                    <tr key={line.id}>
                                                        <td className="border p-2 font-medium">{line.product.name}</td>
                                                        <td className="border p-2 text-right">
                                                            {line.target_price ? new Intl.NumberFormat('id-ID').format(line.target_price) : '-'}
                                                        </td>
                                                        {rfq.quotations.map((q: any) => {
                                                            const quoteLine = q.lines.find((ql: any) => ql.product_id === line.product_id);
                                                            return (
                                                                <td key={q.id} className="border p-2 text-right">
                                                                    {quoteLine ? (
                                                                        <div className={
                                                                            line.target_price && quoteLine.unit_price <= line.target_price ? "text-green-600 font-bold" : ""
                                                                        }>
                                                                            {new Intl.NumberFormat('id-ID').format(quoteLine.unit_price)}
                                                                        </div>
                                                                    ) : '-'}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                                <tr className="font-bold bg-muted/50">
                                                    <td className="border p-2">TOTAL</td>
                                                    <td className="border p-2">-</td>
                                                    {rfq.quotations.map((q: any) => (
                                                        <td key={q.id} className="border p-2 text-right text-lg">
                                                            {new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(q.total_amount)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* RIGHT COLUMN: Vendors */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Invited Vendors</CardTitle>
                                {rfq.status === 'open' && (
                                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Invite Vendors</DialogTitle>
                                                <DialogDescription>Select vendors to send this RFQ to.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleInviteSubmit}>
                                                <div className="space-y-2 mb-4">
                                                    <Label>Vendors</Label>
                                                    <Select onValueChange={(val) => setInviteData('vendor_ids', [...inviteData.vendor_ids, val])}>
                                                        <SelectTrigger><SelectValue placeholder="Add a vendor..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {vendors.filter(v => !rfq.vendors.find((rv:any) => rv.id === v.id)).map(v => (
                                                                <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {inviteData.vendor_ids.map(id => {
                                                            const vendor = vendors.find(v => v.id.toString() === id);
                                                            return <Badge key={id} variant="secondary">{vendor?.name}</Badge>;
                                                        })}
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" disabled={inviteProcessing || inviteData.vendor_ids.length === 0}>Send Invites</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardHeader>
                            <CardContent>
                                {rfq.vendors.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No vendors invited.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {rfq.vendors.map((vendor: any) => (
                                            <div key={vendor.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                                <span>{vendor.name}</span>
                                                <Badge variant={vendor.pivot.status === 'responded' ? 'default' : 'outline'}>
                                                    {vendor.pivot.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
