import AppLayout from "@/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Edit, ArrowLeft, ExternalLink, Plus } from "lucide-react"
import { index, edit } from "@/routes/purchasing/contracts"
import { index as bpoIndex, create as createBpo, show as showBpo } from "@/routes/purchasing/blanket-orders"
import { show as showVendor } from "@/routes/purchasing/vendors"
import { Link } from "@inertiajs/react"
import { format } from "date-fns"
import { useCurrency } from '@/hooks/use-currency';

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
}

export default function ContractsShow({ agreement }: Props) {
  const currency = useCurrency();
  const breadcrumbs = [
    { title: "Purchasing", href: "/purchasing" },
    { title: "Contracts", href: "/purchasing/contracts" },
    { title: agreement.reference_number, href: "#" },
  ]

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
            <Button asChild>
               <Link href={edit(agreement.id).url}>
                 <Edit className="mr-2 h-4 w-4" />
                 Edit Agreement
               </Link>
            </Button>
          </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Agreement Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-muted-foreground">Vendor</span>
                            <div className="font-medium text-lg text-primary">
                                <Link href={showVendor(agreement.vendor.id).url} className="hover:underline flex items-center gap-1">
                                    {agreement.vendor.name} <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Status</span>
                            <div>
                                <Badge variant={agreement.status === 'active' ? 'default' : agreement.status === 'expired' ? 'destructive' : 'secondary'}>
                                  {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
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
                 <CardHeader>
                     <CardTitle>Linked Blanket Orders</CardTitle>
                 </CardHeader>
                 <CardContent>
                     {agreement.blanket_orders.length === 0 ? (
                         <div className="flex flex-col gap-4 text-center py-8 text-muted-foreground">
                             <p>No Blanket Orders linked to this agreement.</p>
                             <Button variant="outline" size="sm" asChild className="mx-auto">
                                 <Link href={createBpo({ query: { vendor_id: agreement.vendor.id, purchase_agreement_id: agreement.id } }).url}>
                                     <Plus className="mr-2 h-4 w-4" /> Create Linked BPO
                                 </Link>
                             </Button>
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
