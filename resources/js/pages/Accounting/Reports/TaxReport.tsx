import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { useState } from "react"

export default function TaxReport({ report, filters }: { report: any, filters: any }) {
    const [dateRange, setDateRange] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || ''
    })

    const applyFilter = () => {
        router.get('/accounting/reports/tax', dateRange, { preserveState: true })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Accounting", href: "/accounting" }, { title: "Tax Report", href: "#" }]}>
            <Head title="Tax Report" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Tax Report</h2>
                    <p className="text-muted-foreground">Detailed Input vs Output Tax analysis.</p>
                </div>
                <div className="flex gap-2 items-end">
                    <div>
                         <Input type="date" value={dateRange.start_date} onChange={e => setDateRange({...dateRange, start_date: e.target.value})} className="w-40" />
                    </div>
                    <div>
                         <Input type="date" value={dateRange.end_date} onChange={e => setDateRange({...dateRange, end_date: e.target.value})} className="w-40" />
                    </div>
                    <Button onClick={applyFilter}>Filter</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Input Tax (Recoverable)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(report.summary.input_tax)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Output Tax (Payable)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(report.summary.output_tax)}</div>
                    </CardContent>
                </Card>
                <Card className={report.summary.net_payable >= 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Payable / (Refundable)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(report.summary.net_payable)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Input Tax Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Ref</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.input_lines.map((line: any) => (
                                    <TableRow key={line.id}>
                                        <TableCell>{format(new Date(line.journal_entry.date), 'PP')}</TableCell>
                                        <TableCell>{line.journal_entry.reference_number}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(line.debit - line.credit)}</TableCell>
                                    </TableRow>
                                ))}
                                {report.input_lines.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">No records</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Output Tax Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Ref</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.output_lines.map((line: any) => (
                                    <TableRow key={line.id}>
                                        <TableCell>{format(new Date(line.journal_entry.date), 'PP')}</TableCell>
                                        <TableCell>{line.journal_entry.reference_number}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(line.credit - line.debit)}</TableCell>
                                    </TableRow>
                                ))}
                                 {report.output_lines.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">No records</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
