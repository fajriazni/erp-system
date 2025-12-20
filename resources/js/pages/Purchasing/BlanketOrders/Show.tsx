import AppLayout from "@/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Edit, ArrowLeft, ExternalLink, FileText } from "lucide-react"
import { Link } from "@inertiajs/react"
import { format } from "date-fns"
import { useCurrency } from '@/hooks/use-currency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { index, edit } from "@/routes/purchasing/blanket-orders"
import { index as contractIndex, show as contractShow } from "@/routes/purchasing/contracts"
import { show as orderShow, create as orderCreate } from "@/routes/purchasing/orders"
import { index as vendorShow } from "@/routes/purchasing/vendors"

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
}

export default function BlanketOrdersShow({ blanket_order }: Props) {
  const currency = useCurrency();
  const breadcrumbs = [
    { title: "Purchasing", href: "/purchasing" },
    { title: "Blanket Orders", href: "/purchasing/blanket-orders" },
    { title: blanket_order.number, href: "#" },
  ]

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
            <Button asChild>
               <Link href={edit(blanket_order.id).url}>
                 <Edit className="mr-2 h-4 w-4" />
                 Edit BPO
               </Link>
            </Button>
          </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>BPO Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-muted-foreground">Vendor</span>
                            <div className="font-medium text-lg text-primary">
                                <Link href={vendorShow().url} className="hover:underline flex items-center gap-1">
                                    {blanket_order.vendor.name} <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Status</span>
                            <div>
                                <Badge variant={blanket_order.status === 'active' ? 'default' : blanket_order.status === 'closed' ? 'secondary' : 'outline'}>
                                  {blanket_order.status.charAt(0).toUpperCase() + blanket_order.status.slice(1)}
                                </Badge>
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
    </AppLayout>
  )
}
