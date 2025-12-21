import { useState } from "react"
import { toast } from "sonner"
import AppLayout from "@/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Edit, ArrowLeft, ExternalLink, FileText, CheckCircle, XCircle, Send, PlayCircle, PauseCircle, Ban, Plus } from "lucide-react"
import { Link, router } from "@inertiajs/react"
import { format } from "date-fns"
import { useCurrency } from '@/hooks/use-currency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { index, edit, activate, close, revise } from "@/routes/purchasing/blanket-orders"
import { index as contractIndex, show as contractShow } from "@/routes/purchasing/contracts"
import { show as orderShow, create as orderCreate } from "@/routes/purchasing/orders"
import { show as vendorShow } from "@/routes/purchasing/vendors"
import WorkflowTimeline from '@/components/WorkflowTimeline'
import axios from "axios"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BlanketOrderLine {
    id: number
    product: {
        name: string
        sku: string
        id: number
    }
    unit_price: string
    quantity_agreed: string | null
    quantity_ordered: string
}

interface PurchaseOrder {
    id: number
    document_number: string
    date: string
    total: string
    status: string
}

interface BlanketOrder {
    id: number
    number: string
    vendor: {
        id: number
        name: string
    }
    agreement?: {
        id: number
        reference_number: string
        title: string
    }
    start_date: string
    end_date: string | null
    amount_limit: string
    status: string
    renewal_reminder_days: number
    is_auto_renew: boolean
    lines: BlanketOrderLine[]
    releases: PurchaseOrder[]
}

interface Props {
  blanket_order: BlanketOrder
  workflowInstance: any
  pendingApprovalTask?: any
}

// ... helper functions ...

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'open': return 'default';
        case 'active': return 'default';
        case 'partially_delivered': return 'default';
        case 'fully_delivered': return 'secondary';
        case 'depleted': return 'secondary';
        case 'pending_approval': return 'secondary';
        case 'sent': return 'secondary';
        case 'draft': return 'secondary';
        case 'closed': return 'outline';
        case 'expired': return 'destructive';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
}

export default function BlanketOrdersShow({ blanket_order, workflowInstance, pendingApprovalTask }: Props) {
  const currency = useCurrency();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Purchasing', href: '/purchasing' },
    { title: 'Blanket Orders', href: index().url },
    { title: blanket_order.number, href: '#' },
  ]

  const handleCancel = () => {
      setProcessing(true);
      router.post(`/purchasing/blanket-orders/${blanket_order.id}/cancel`, {}, {
          onSuccess: () => {
              toast.success('BPO cancelled.');
              setCancelDialogOpen(false);
          },
          onError: (errors: any) => {
             toast.error(errors.error || 'Failed to cancel BPO');
             setProcessing(false);
          },
          onFinish: () => setProcessing(false),
      })
  }

  const handleSubmit = () => {
       // Using new submit action if status is draft
       router.post(`/purchasing/blanket-orders/${blanket_order.id}/submit`, {}, {
           onSuccess: () => toast.success('BPO submitted for approval.'),
       })
  }
  
  // Deprecated/Legacy direct send (if strictly needed, but submit now covers it)
  // const handleSend = () => ... 

  const handleApprove = async () => {
      setProcessing(true);
      try {
          await axios.post(`/api/approval-tasks/${pendingApprovalTask.id}/approve`, {});
          toast.success('Approval task approved successfully');
          setApproveDialogOpen(false);
          router.reload();
      } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to approve task');
      } finally {
          setProcessing(false);
      }
  };

  const handleReject = async () => {
      if (!rejectReason.trim()) {
          toast.error('Rejection reason is required');
          return;
      }

      setProcessing(true);
      try {
          await axios.post(`/api/approval-tasks/${pendingApprovalTask.id}/reject`, {
              reason: rejectReason
          });
          toast.success('Approval task rejected successfully');
          setRejectDialogOpen(false);
          setRejectReason('');
          router.reload();
      } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to reject task');
      } finally {
          setProcessing(false);
      }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <PageHeader
        title={blanket_order.number}
        description={`Blanket Purchase Order for ${blanket_order.vendor.name}`}
      >
          <div className="flex gap-2">
            <Button variant="outline" asChild>
               <Link href={index().url}>
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back
               </Link>
            </Button>
            
            {/* Draft Actions */}
            {blanket_order.status === 'draft' && (
                <>
                    <Button variant="outline" asChild>
                       <Link href={edit(blanket_order.id).url}>
                         <Edit className="mr-2 h-4 w-4" />
                         Edit BPO
                       </Link>
                    </Button>
                    <Button onClick={handleSubmit}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                    </Button>
                    {/* Send to Vendor legacy button removed or mapped to submit */}
                </>
            )}

             {/* Approval Actions */}
             {pendingApprovalTask && (
                <>
                    <Button 
                        variant="default"
                        onClick={() => setApproveDialogOpen(true)}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={() => setRejectDialogOpen(true)}
                        disabled={processing}
                    >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                </>
            )}
            
            {blanket_order.status === 'sent' && (
                <Button onClick={() => router.post(activate(blanket_order.id).url)}>
                     Activate
                </Button>
            )}

             {/* Revise allowed for most Non-Draft/Cancelled states */}
             {['open', 'partially_delivered', 'fully_delivered', 'depleted', 'closed', 'active'].includes(blanket_order.status) && (
                <Button variant="outline" onClick={() => router.post(revise(blanket_order.id).url)}>
                     Revise
                </Button>
            )}

            {/* Close allowed for Running states */}
            {['open', 'partially_delivered', 'active'].includes(blanket_order.status) && (
                <Button variant="destructive" onClick={() => router.post(close(blanket_order.id).url)}>
                    Close BPO
                </Button>
            )}
            
            {/* Cancel allowed for Draft/Sent/PendingApproval */}
             {['draft', 'sent', 'pending_approval'].includes(blanket_order.status) && (
                 <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setCancelDialogOpen(true)}>
                     Cancel
                 </Button>
             )}
          </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>BPO Details</CardTitle>
                        <Badge variant={getStatusBadgeVariant(blanket_order.status) as any}>
                             {blanket_order.status.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-muted-foreground">Vendor</span>
                            <div className="font-medium text-lg text-primary">
                                <Link href={vendorShow(blanket_order.vendor.id).url} className="hover:underline flex items-center gap-1">
                                    {blanket_order.vendor.name} <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">Start Date</span>
                             <div className="font-medium">{format(new Date(blanket_order.start_date), "PPP")}</div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">End Date</span>
                             <div className="font-medium">{blanket_order.end_date ? format(new Date(blanket_order.end_date), "PPP") : "No Expiry"}</div>
                        </div>
                         <div>
                             <span className="text-sm text-muted-foreground">Amount Limit</span>
                              <div className="font-medium">{currency.format(Number(blanket_order.amount_limit))}</div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">Renewal Reminder</span>
                             <div className="font-medium">{blanket_order.renewal_reminder_days} Days</div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">Auto Renew</span>
                             <div className="font-medium">
                                <Badge variant={blanket_order.is_auto_renew ? "outline" : "secondary"}>
                                    {blanket_order.is_auto_renew ? "Yes" : "No"}
                                </Badge>
                             </div>
                        </div>
                        {blanket_order.agreement && (
                            <div>
                                <span className="text-sm text-muted-foreground">Linked Agreement</span>
                                <div className="font-medium">
                                    <Link href={contractShow(blanket_order.agreement.id).url} className="text-primary hover:underline">
                                        {blanket_order.agreement.reference_number}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
             </Card>

             <Card>
                 <CardHeader>
                     <CardTitle>Agreed Lines</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Agreed Price</TableHead>
                                <TableHead>Qty Limit</TableHead>
                                <TableHead>Qty Ordered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blanket_order.lines.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        No specific lines defined.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                blanket_order.lines.map(line => (
                                    <TableRow key={line.id}>
                                        <TableCell>
                                            <div className="font-medium">{line.product.name}</div>
                                            <div className="text-xs text-muted-foreground">{line.product.sku}</div>
                                        </TableCell>
                                        <TableCell>${Number(line.unit_price).toLocaleString()}</TableCell>
                                        <TableCell>{line.quantity_agreed ? Number(line.quantity_agreed).toLocaleString() : "Unlimited"}</TableCell>
                                        <TableCell>{Number(line.quantity_ordered).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                     </Table>
                 </CardContent>
             </Card>
        </div>

        <div className="space-y-6">
             {/* Workflow Timeline */}
             <Card>
                <CardHeader>
                    <CardTitle>Workflow Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    {workflowInstance ? (
                        <WorkflowTimeline workflowInstance={workflowInstance} />
                    ) : (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            Workflow will appear after submission.
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card>
                 <CardHeader>
                     <CardTitle>Releases (Purchase Orders)</CardTitle>
                 </CardHeader>
                 <CardContent>
                     {blanket_order.releases.length === 0 ? (
                         <div className="text-center py-4 text-muted-foreground">
                             No releases generated yet.
                         </div>
                     ) : (
                         <div className="space-y-4">
                             {blanket_order.releases.map(po => (
                                 <div key={po.id} className="border p-3 rounded-lg flex justify-between items-center">
                                     <div>
                                         <Link href={orderShow(po.id).url} className="font-medium hover:underline text-primary">
                                            {po.document_number}
                                         </Link>
                                         <div className="text-xs text-muted-foreground">{format(new Date(po.date), "PP")}</div>
                                     </div>
                                     <div className="text-right">
                                         <div className="font-medium">${Number(po.total).toLocaleString()}</div>
                                         <Badge variant="outline" className="text-xs">{po.status}</Badge>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                     <div className="mt-4 pt-4 border-t">
                         <Button className="w-full" asChild>
                             <Link href={orderCreate({ query: { blanket_order_id: blanket_order.id } }).url}>
                                 <FileText className="mr-2 h-4 w-4" />
                                 Create Release (PO)
                             </Link>
                         </Button>
                     </div>
                 </CardContent>
             </Card>
        </div>
      </div>
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Blanket Order</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this Blanket Order? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={processing}>
                        Keep BPO
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={processing}>
                        {processing ? 'Cancelling...' : 'Yes, Cancel BPO'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approve Blanket Order</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to approve this Blanket Order?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
                        {processing ? 'Approving...' : 'Approve'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Blanket Order</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejection.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="rejectReason">Rejection Reason *</Label>
                        <Textarea
                            id="rejectReason"
                            placeholder="Enter reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectReason.trim()}>
                        {processing ? 'Rejecting...' : 'Reject'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
  )
}
