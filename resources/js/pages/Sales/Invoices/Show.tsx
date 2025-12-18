import AppLayout from "@/layouts/app-layout"
import { Head, Link, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Printer, CheckCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ShowInvoice({ invoice }: { invoice: any }) {

    const postInvoice = () => {
        if (confirm('Are you sure you want to post this invoice? This action creates journal entries.')) {
            router.post(`/sales/invoices/${invoice.id}/post`)
        }
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Invoices", href: "/sales/invoices" }, { title: invoice.invoice_number, href: "#" }]}>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/sales/invoices">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{invoice.invoice_number}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{invoice.customer?.name}</span>
                            <span>•</span>
                            <span>{format(new Date(invoice.date), "PP")}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     {invoice.status === 'draft' && (
                        <Button onClick={postInvoice}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Post Invoice
                        </Button>
                    )}
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.lines.map((line: any) => (
                                        <TableRow key={line.id}>
                                            <TableCell>{line.product?.name || '-'}</TableCell>
                                            <TableCell>{line.description}</TableCell>
                                            <TableCell className="text-right">{line.quantity}</TableCell>
                                            <TableCell className="text-right">{parseFloat(line.unit_price).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{parseFloat(line.total).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge>{invoice.status}</Badge>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reference</span>
                                <span>{invoice.reference_number || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Due Date</span>
                                <span>{invoice.due_date ? format(new Date(invoice.due_date), "PP") : '-'}</span>
                            </div>
                            <Separator />
                             <div className="space-y-2 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{parseFloat(invoice.subtotal).toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>{parseFloat(invoice.tax_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>{parseFloat(invoice.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
