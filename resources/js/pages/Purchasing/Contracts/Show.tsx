import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import AppLayout from "@/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Edit, ArrowLeft, ExternalLink, Plus, Send, CheckCircle, XCircle, PauseCircle, PlayCircle, Ban } from "lucide-react"
import { index, edit, close, revise, submit } from "@/routes/purchasing/contracts"
import { index as bpoIndex, create as createBpo, show as showBpo } from "@/routes/purchasing/blanket-orders"
import { show as showVendor } from "@/routes/purchasing/vendors"
import { Link, router } from "@inertiajs/react"
import { format } from "date-fns"
import { useCurrency } from '@/hooks/use-currency';
import WorkflowTimeline from '@/components/WorkflowTimeline'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BlanketOrder {
  id: number
  number: string
  amount_limit: string
  status: string
}

interface Agreement {
  id: number
  reference_number: string
  title: string
  vendor: {
    id: number
    name: string
  }
  start_date: string
  end_date: string | null
  status: string
  total_value_cap: string | null
  document_path: string | null
  renewal_reminder_days: number
  is_auto_renew: boolean
  blanket_orders: BlanketOrder[]
}

interface Props {
  agreement: Agreement
  workflowInstance: any
  pendingApprovalTask?: any
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'active': return 'default'; // primary/green usually
        case 'draft': return 'secondary';
        case 'pending_approval': return 'warning';
        case 'expired': return 'destructive';
        case 'fulfilled': return 'outline';
        case 'on_hold': return 'warning'; // or specific caution color
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
}

const getStatusLabel = (status: string) => {
     switch (status) {
        case 'pending_approval': return 'Pending Approval';
        case 'on_hold': return 'On Hold';
        default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
}

export default function ContractsShow({ agreement, workflowInstance, pendingApprovalTask }: Props) {
  const currency = useCurrency();
  const [processing, setProcessing] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Purchasing', href: '/purchasing' },
    { title: 'Contracts', href: index().url },
    { title: agreement.reference_number, href: '#' },
  ]

  const handleSubmit = () => {
      router.post(submit(agreement.id).url, {}, {
          onSuccess: () => toast.success('Agreement submitted for approval.'),
          onError: (errors: any) => toast.error(errors.error || 'Failed to submit agreement'),
      });
  };

  const handleHold = () => {
      router.post(`/purchasing/contracts/${agreement.id}/hold`, {}, {
          onSuccess: () => toast.success('Agreement put on hold.'),
          onError: (errors: any) => toast.error(errors.error || 'Failed to hold agreement'),
      });
  };

  const handleResume = () => {
      router.post(`/purchasing/contracts/${agreement.id}/resume`, {}, {
          onSuccess: () => toast.success('Agreement resumed.'),
          onError: (errors: any) => toast.error(errors.error || 'Failed to resume agreement'),
      });
  };

  const handleCancel = () => {
      setProcessing(true);
      router.post(`/purchasing/contracts/${agreement.id}/cancel`, {}, {
          onSuccess: () => {
              toast.success('Agreement cancelled.');
              setCancelDialogOpen(false);
          },
          onError: (errors: any) => {
              toast.error(errors.error || 'Failed to cancel agreement');
              setProcessing(false);
          },
          onFinish: () => setProcessing(false),
      });
  };

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
        title={agreement.title}
        description={`Reference: ${agreement.reference_number}`}
      >
          <div className="flex gap-2">
            <Button variant="outline" asChild>
               <Link href={index().url}>
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back
               </Link>
            </Button>
            
            {/* Draft Actions */}
            {agreement.status === 'draft' && (
                <>
                    <Button variant="outline" asChild>
                       <Link href={edit(agreement.id).url}>
                         <Edit className="mr-2 h-4 w-4" />
                         Edit Agreement
                       </Link>
                    </Button>
                    <Button onClick={handleSubmit}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                    </Button>
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

            {/* Active Actions */}
            {agreement.status === 'active' && (
                <>
                    <Button variant="outline" onClick={handleHold}>
                        <PauseCircle className="mr-2 h-4 w-4" /> Hold
                    </Button>
                    <Button onClick={() => router.visit(createBpo({ query: { purchase_agreement_id: agreement.id, vendor_id: agreement.vendor.id } }).url)}>
                        <Plus className="mr-2 h-4 w-4" /> Create BPO
                    </Button>
                </>
            )}

             {/* On Hold Actions */}
             {agreement.status === 'on_hold' && (
                <Button variant="outline" onClick={handleResume}>
                    <PlayCircle className="mr-2 h-4 w-4" /> Resume
                </Button>
            )}

             {/* Cancel Action (Available for Draft, Pending, Active, On Hold) */}
             {['draft', 'pending_approval', 'active', 'on_hold'].includes(agreement.status) && (
                 <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setCancelDialogOpen(true)}>
                     <Ban className="mr-2 h-4 w-4" /> Cancel
                 </Button>
             )}
            
          </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Agreement Details</CardTitle>
                    <Badge variant={getStatusBadgeVariant(agreement.status) as any}>
                        {getStatusLabel(agreement.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Vendor</div>
                            <div className="flex items-center gap-2">
                                <Link href={showVendor(agreement.vendor.id).url} className="hover:underline flex items-center gap-1">
                                    {agreement.vendor.name} <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Status</span>
                            <div>
                                <Badge variant={agreement.status === 'active' ? 'default' : agreement.status === 'expired' ? 'destructive' : 'secondary'}>
                                  {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1).replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">Start Date</span>
                             <div className="font-medium">{format(new Date(agreement.start_date), "PPP")}</div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">End Date</span>
                             <div className="font-medium">{agreement.end_date ? format(new Date(agreement.end_date), "PPP") : "No Expiry"}</div>
                        </div>
                         <div>
                             <span className="text-sm text-muted-foreground">Total Value Cap</span>
                              <div className="font-medium">{agreement.total_value_cap ? currency.format(Number(agreement.total_value_cap)) : "Unlimited"}</div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">Renewal Reminder</span>
                             <div className="font-medium">{agreement.renewal_reminder_days} Days</div>
                        </div>
                        <div>
                             <span className="text-sm text-muted-foreground">Auto Renew</span>
                             <div className="font-medium">
                                <Badge variant={agreement.is_auto_renew ? "outline" : "secondary"}>
                                    {agreement.is_auto_renew ? "Yes" : "No"}
                                </Badge>
                             </div>
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                     <CardTitle>Linked Blanket Orders</CardTitle>
                     <Button variant="outline" size="sm" asChild>
                         <Link href={createBpo({ query: { vendor_id: agreement.vendor.id, purchase_agreement_id: agreement.id } }).url}>
                             <Plus className="mr-2 h-4 w-4" /> Create BPO
                         </Link>
                     </Button>
                 </CardHeader>
                 <CardContent>
                     {agreement.blanket_orders.length === 0 ? (
                         <div className="text-center py-8 text-muted-foreground">
                             <p>No Blanket Orders linked to this agreement.</p>
                         </div>
                     ) : (
                         <div className="space-y-4">
                             {agreement.blanket_orders.map(bpo => (
                                 <div key={bpo.id} className="flex items-center justify-between border p-3 rounded-lg">
                                     <div>
                                         <div className="font-medium">{bpo.number}</div>
                                         <div className="text-sm text-muted-foreground">Limit: {currency.format(Number(bpo.amount_limit))}</div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <Badge>{bpo.status}</Badge>
                                         <Button variant="ghost" size="sm" asChild>
                                             <Link href={showBpo(bpo.id).url}>View</Link> 
                                         </Button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
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
                     <CardTitle>Document</CardTitle>
                 </CardHeader>
                 <CardContent>
                     {agreement.document_path ? (
                         <div className="border rounded-lg p-4 text-center">
                             <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                             <div className="text-sm font-medium mb-4 truncate text-muted-foreground px-2">
                                {agreement.document_path.split('/').pop()}
                             </div>
                             <Button variant="outline" className="w-full" asChild>
                                 <a href={`/storage/${agreement.document_path}`} target="_blank" rel="noreferrer">
                                     <Download className="mr-2 h-4 w-4" /> Download PDF
                                 </a>
                             </Button>
                         </div>
                     ) : (
                         <div className="text-center text-muted-foreground py-4">
                             No document uploaded.
                         </div>
                     )}
                 </CardContent>
             </Card>
        </div>
      </div>

       <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approve Agreement</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to approve this agreement?
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
                    <DialogTitle>Reject Agreement</DialogTitle>
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

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Agreement</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this agreement? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={processing}>
                        Keep Agreement
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={processing}>
                        {processing ? 'Cancelling...' : 'Yes, Cancel Agreement'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </AppLayout>
  )
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}
