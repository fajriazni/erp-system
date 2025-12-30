import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import DocumentFlow from '@/components/DocumentFlow';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Add router import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrency } from "@/hooks/use-currency"
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Plus, Gavel, CheckCircle, XCircle, Crown } from 'lucide-react';
import { index, bid } from '@/routes/purchasing/rfqs';
import { award } from '@/routes/purchasing/quotations';
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

// Remove const route = (window as any).route;

interface BidItem {
    product_id: string;
    quantity: number;
    unit_price: string;
    notes: string;
}

interface BidForm {
    vendor_id: string;
    reference_number: string;
    quote_date: string;
    valid_until: string;
    currency: string;
    notes: string;
    items: BidItem[];
}

export default function Show({ rfq, vendors, products, suggestedVendorIds = [] }: { rfq: any, vendors: any[], products: any[], suggestedVendorIds?: number[] }) {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [bidOpen, setBidOpen] = useState(false);
    const [showRecommendedOnly, setShowRecommendedOnly] = useState(suggestedVendorIds?.length ? true : false);
    const [quotationToAward, setQuotationToAward] = useState<number | null>(null);

    // Invite Form
    const { data: inviteData, setData: setInviteData, post: postInvite, processing: inviteProcessing, reset: resetInvite } = useForm({
        vendor_ids: [] as string[],
    });

    // Bid Form
    const { data: bidData, setData: setBidData, post: postBid, processing: bidProcessing, reset: resetBid, errors: bidErrors } = useForm<BidForm>({
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

    // Helper to filter vendors
    const availableVendors = vendors.filter(v => !rfq.vendors.find((rv:any) => rv.id === v.id));
    const displayedVendors = (showRecommendedOnly 
        ? availableVendors.filter(v => suggestedVendorIds?.includes(v.id)) 
        : availableVendors).filter(v => !inviteData.vendor_ids.includes(v.id.toString()));

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postInvite(route('purchasing.rfqs.invite', rfq.id), {
            onSuccess: () => {
                setInviteOpen(false);
                resetInvite();
            }
        });
    };

    const handleBidSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postBid(bid.url(rfq.id), {
             onSuccess: () => {
                setBidOpen(false);
                resetBid();
            }
        });
    };

    const handleAward = (quotationId: number) => {
        setQuotationToAward(quotationId);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'RFQs', href: index.url() },
            { title: rfq.document_number }
        ]}>
            <Head title={`RFQ ${rfq.document_number}`} />
            
            <div className="container mx-auto space-y-6">
                <PageHeader
                    title={`${rfq.document_number}: ${rfq.title}`}
                    description={
                        <div className="flex items-center gap-2 mt-1">
                             <Badge variant={rfq.status === 'open' ? 'default' : 'secondary'}>{rfq.status.toUpperCase()}</Badge>
                             <span className="text-muted-foreground">Deadline: {new Date(rfq.deadline).toLocaleDateString('id-ID')}</span>
                        </div>
                    }
                >
                    <Button variant="outline" asChild>
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </PageHeader>

                <DocumentFlow type="rfq" id={rfq.id} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Overview & Items */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requested Items</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-4">Product</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Target Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rfq.lines.map((line: any) => (
                                            <TableRow key={line.id}>
                                                <TableCell className="pl-4">
                                                    <div className="font-medium">{line.product.name}</div>
                                                    <div className="text-xs text-muted-foreground">{line.product.code}</div>
                                                </TableCell>
                                                <TableCell>{line.quantity} {line.uom}</TableCell>
                                                <TableCell>{line.target_price ? useCurrency().format(line.target_price) : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
                                                                      {rfq.vendors
                                                                        .filter((v: any) => !rfq.quotations.some((q: any) => q.vendor_id === v.id))
                                                                        .map((v: any) => (
                                                                          <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                                                      ))}
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
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Vendor</TableHead>
                                                        <TableHead>Reference</TableHead>
                                                        <TableHead>Total Amount</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {rfq.quotations.map((quote: any) => (
                                                        <TableRow key={quote.id}>
                                                            <TableCell className="font-bold">{quote.vendor.name}</TableCell>
                                                            <TableCell>{quote.reference_number || '-'}</TableCell>
                                                            <TableCell className="font-medium text-emerald-600">
                                                                {useCurrency().format(quote.total_amount)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {quote.status === 'won' && <Badge className="bg-green-500">AWARDED</Badge>}
                                                                {quote.status !== 'won' && <Badge variant="outline">{quote.status.toUpperCase()}</Badge>}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {quote.status === 'submitted' && rfq.status === 'open' && (
                                                                    <Button size="sm" variant="outline" onClick={() => handleAward(quote.id)}>
                                                                        <CheckCircle className="mr-2 h-4 w-4" /> Award
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="comparison">
                                <Card>
                                    <CardContent className="p-0 overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[300px]">Product</TableHead>
                                                    <TableHead className="text-right">Target Price</TableHead>
                                                    {rfq.quotations.map((q: any) => (
                                                        <TableHead key={q.id} className={`text-right min-w-[150px] ${q.status === 'won' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : ''}`}>
                                                            <div className="flex flex-col items-end">
                                                                <div className="font-bold flex items-center gap-1">
                                                                    {q.status === 'won' && <Crown className="h-4 w-4 fill-emerald-600 text-emerald-600" />}
                                                                    {q.vendor.name}
                                                                </div>
                                                                {q.status === 'won' && <div className="text-[10px] font-normal uppercase tracking-wider text-emerald-600">Winner</div>}
                                                            </div>
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rfq.lines.map((line: any) => {
                                                    // Calculate best price for this line
                                                    const prices = rfq.quotations
                                                        .map((q: any) => {
                                                            const item = q.lines.find((ql: any) => ql.product_id === line.product_id);
                                                            return item ? parseFloat(item.unit_price) : null;
                                                        })
                                                        .filter((p: any) => p !== null);
                                                    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

                                                    return (
                                                        <TableRow key={line.id}>
                                                            <TableCell>
                                                                <div className="font-medium">{line.product.name}</div>
                                                                <div className="text-xs text-muted-foreground">{line.product.code}</div>
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground">
                                                                {line.target_price ? useCurrency().format(line.target_price) : '-'}
                                                            </TableCell>
                                                            {rfq.quotations.map((q: any) => {
                                                                const quoteLine = q.lines.find((ql: any) => ql.product_id === line.product_id);
                                                                const isBestPrice = quoteLine && minPrice !== null && parseFloat(quoteLine.unit_price) === minPrice;
                                                                
                                                                return (
                                                                    <TableCell key={q.id} className={`text-right ${q.status === 'won' ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}>
                                                                        {quoteLine ? (
                                                                            <div className={isBestPrice ? "text-emerald-600 font-bold" : ""}>
                                                                                {useCurrency().format(quoteLine.unit_price)}
                                                                                {isBestPrice && <span className="sr-only"> (Best Price)</span>}
                                                                            </div>
                                                                        ) : <span className="text-muted-foreground">-</span>}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={2} className="font-bold">TOTAL</TableCell>
                                                    {rfq.quotations.map((q: any) => {
                                                        // Calculate if this is the best total price
                                                        const totalPrices = rfq.quotations.map((qu: any) => parseFloat(qu.total_amount));
                                                        const minTotal = Math.min(...totalPrices);
                                                        const isBestTotal = parseFloat(q.total_amount) === minTotal;

                                                        return (
                                                            <TableCell key={q.id} className={`text-right font-bold lg ${q.status === 'won' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : ''}`}>
                                                                <div className={isBestTotal && q.status !== 'won' ? "text-emerald-600" : ""}>
                                                                    {useCurrency().format(q.total_amount)}
                                                                </div>
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
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
                                {['open', 'draft'].includes(rfq.status) && rfq.vendors.length > 0 && (
                                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Invite</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Invite Vendors</DialogTitle>
                                                <DialogDescription>Select vendors to send this RFQ to.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleInviteSubmit}>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between items-center">
                                                        <Label>Vendors</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <input 
                                                                type="checkbox" 
                                                                id="rec-only" 
                                                                checked={showRecommendedOnly} 
                                                                onChange={e => setShowRecommendedOnly(e.target.checked)} 
                                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                            />
                                                            <Label htmlFor="rec-only" className="text-xs font-normal text-muted-foreground cursor-pointer">
                                                                Show Recommended Only ({suggestedVendorIds?.length || 0})
                                                            </Label>
                                                        </div>
                                                    </div>
                                                    <Select 
                                                        key={`header-${inviteData.vendor_ids.length}`}
                                                        onValueChange={(val) => {
                                                        if (!inviteData.vendor_ids.includes(val)) {
                                                            setInviteData('vendor_ids', [...inviteData.vendor_ids, val]);
                                                        }
                                                    }}>
                                                        <SelectTrigger><SelectValue placeholder="Add a vendor..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {displayedVendors.length === 0 && <SelectItem value="none" disabled>No vendors found</SelectItem>}
                                                            {displayedVendors.map(v => (
                                                                <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {inviteData.vendor_ids.map(id => {
                                                            const vendor = vendors.find(v => v.id.toString() === id);
                                                            return (
                                                                <Badge key={id} variant="secondary" className="pr-1">
                                                                    {vendor?.name}
                                                                    <button 
                                                                        type="button"
                                                                        className="ml-1 hover:text-destructive" 
                                                                        onClick={() => setInviteData('vendor_ids', inviteData.vendor_ids.filter(vid => vid !== id))}
                                                                    >
                                                                        <XCircle className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            );
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
                                    <div className="text-center py-6">
                                        <p className="text-muted-foreground text-sm mb-4">No vendors invited yet.</p>
                                        {['open', 'draft'].includes(rfq.status) && (
                                            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm"><Mail className="mr-2 h-4 w-4" /> Invite Vendors</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Invite Vendors</DialogTitle>
                                                        <DialogDescription>Select vendors to send this RFQ to.</DialogDescription>
                                                    </DialogHeader>
                                                    <form onSubmit={handleInviteSubmit}>
                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex justify-between items-center">
                                                                <Label>Vendors</Label>
                                                                <div className="flex items-center space-x-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        id="rec-only-empty" 
                                                                        checked={showRecommendedOnly} 
                                                                        onChange={e => setShowRecommendedOnly(e.target.checked)} 
                                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                                    />
                                                                    <Label htmlFor="rec-only-empty" className="text-xs font-normal text-muted-foreground cursor-pointer">
                                                                        Show Recommended Only ({suggestedVendorIds?.length || 0})
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                            <Select 
                                                                key={`empty-${inviteData.vendor_ids.length}`}
                                                                onValueChange={(val) => {
                                                                if (!inviteData.vendor_ids.includes(val)) {
                                                                    setInviteData('vendor_ids', [...inviteData.vendor_ids, val]);
                                                                }
                                                            }}>
                                                                <SelectTrigger><SelectValue placeholder="Add a vendor..." /></SelectTrigger>
                                                                <SelectContent>
                                                                    {displayedVendors.length === 0 && <SelectItem value="none" disabled>No vendors found</SelectItem>}
                                                                    {displayedVendors.map(v => (
                                                                        <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {inviteData.vendor_ids.map(id => {
                                                                    const vendor = vendors.find(v => v.id.toString() === id);
                                                                    return (
                                                                        <Badge key={id} variant="secondary" className="pr-1">
                                                                            {vendor?.name}
                                                                            <button 
                                                                                type="button"
                                                                                className="ml-1 hover:text-destructive" 
                                                                                onClick={() => setInviteData('vendor_ids', inviteData.vendor_ids.filter(vid => vid !== id))}
                                                                            >
                                                                                <XCircle className="h-3 w-3" />
                                                                                </button>
                                                                        </Badge>
                                                                    );
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
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Vendor Name</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rfq.vendors.map((vendor: any) => (
                                                <TableRow key={vendor.id}>
                                                    <TableCell>{vendor.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={vendor.pivot.status === 'responded' ? 'default' : 'outline'}>
                                                            {vendor.pivot.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <AlertDialog open={!!quotationToAward} onOpenChange={(open) => !open && setQuotationToAward(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Award this Quotation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will close the RFQ and create a Draft Purchase Order based on this quotation. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => quotationToAward && router.post(award.url(quotationToAward))}>
                            Confirm Award
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
