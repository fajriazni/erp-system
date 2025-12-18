import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Printer, Edit } from "lucide-react"

export default function Show({ entry }: { entry: any }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Journal Entries", href: "/accounting/journal-entries" },
                { title: entry.reference_number, href: `/accounting/journal-entries/${entry.id}` },
            ]}
        >
            <Head title={`Journal Entry ${entry.reference_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/accounting/journal-entries">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{entry.reference_number}</h2>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{format(new Date(entry.date), "PPP")}</span>
                                <span>•</span>
                                <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                                    {entry.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {entry.status === 'draft' && (
                             <Button variant="outline" asChild>
                                <Link href={`/accounting/journal-entries/${entry.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Journal Lines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entry.lines.map((line: any) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {line.chart_of_account.code} - {line.chart_of_account.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Number(line.debit) > 0 ? Number(line.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Number(line.credit) > 0 ? Number(line.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right">
                                            {entry.lines.reduce((sum: number, line: any) => sum + Number(line.debit), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {entry.lines.reduce((sum: number, line: any) => sum + Number(line.credit), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Description</div>
                                <div>{entry.description || "No description provided."}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Created At</div>
                                <div>{format(new Date(entry.created_at), "PPP p")}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
