import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Printer, Edit, Clock, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"

export default function Show({ entry }: { entry: any }) {
    const totalDebit = entry.lines.reduce((sum: number, line: any) => sum + Number(line.debit), 0)
    const totalCredit = entry.lines.reduce((sum: number, line: any) => sum + Number(line.credit), 0)

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Journal Entries", href: "/accounting/journal-entries" },
                { title: entry.reference_number, href: "#" },
            ]}
        >
            <Head title={`Journal Entry - ${entry.reference_number}`} />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <PageHeader
                    title={entry.reference_number}
                    description={
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-muted-foreground">{entry.description || 'Journal entry details and transaction lines.'}</span>
                            <Separator orientation="vertical" className="h-3 shadow-none border-none" />
                            <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'} className="px-2 py-0 h-5 text-[10px] uppercase font-bold tracking-wider">
                                {entry.status}
                            </Badge>
                        </div>
                    }
                    className="mb-8"
                >
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild size="sm">
                            <Link href="/accounting/journal-entries">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                         {entry.status === 'draft' && (
                             <Button size="sm" asChild>
                                <Link href={`/accounting/journal-entries/${entry.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Entry
                                </Link>
                            </Button>
                        )}
                    </div>
                </PageHeader>

                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">General Information</CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Created {format(new Date(entry.created_at), "PPP p")}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Posting Date</Label>
                            <div className="font-medium">{format(new Date(entry.date), "PPP")}</div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Currency</Label>
                            <div className="font-mono">{entry.currency_code || 'USD'}</div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rate</Label>
                            <div className="font-mono">{Number(entry.exchange_rate).toFixed(6)}</div>
                        </div>

                         <div className="space-y-1">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Amount</Label>
                            <div className="font-mono font-bold">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-1 bg-primary rounded-full" />
                            <div>
                                <CardTitle className="text-lg">Journal Lines</CardTitle>
                                <CardDescription>Transaction detail records.</CardDescription>
                            </div>
                        </div>
                        
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Balanced
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6 w-[45%]">Account & Narration</TableHead>
                                    <TableHead className="text-right w-[20%]">Debit</TableHead>
                                    <TableHead className="text-right w-[20%]">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entry.lines.map((line: any) => (
                                    <TableRow key={line.id} className="hover:bg-muted/5 border-muted/40 align-top">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{line.chart_of_account.code}</span>
                                                    <span className="font-medium text-sm">{line.chart_of_account.name}</span>
                                                </div>
                                                {line.description && (
                                                    <div className="text-sm text-muted-foreground mt-1 ml-1">
                                                        {line.description}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right font-mono text-sm">
                                            {Number(line.debit) > 0 ? Number(line.debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <span className="text-muted-foreground/30">-</span>}
                                        </TableCell>
                                        <TableCell className="py-4 text-right font-mono text-sm">
                                            {Number(line.credit) > 0 ? Number(line.credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <span className="text-muted-foreground/30">-</span>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter className="bg-muted/5 border-t border-muted/40">
                                <TableRow className="hover:bg-transparent">
                                    <TableCell className="w-[45%] pl-6 text-right font-semibold text-muted-foreground uppercase text-[10px] tracking-wider align-middle py-4">
                                        Totals
                                    </TableCell>
                                    <TableCell className="w-[20%] text-right font-mono font-bold text-base text-emerald-600 align-middle py-4">
                                        {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="w-[20%] text-right font-mono font-bold text-base text-emerald-600 align-middle py-4">
                                        {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
