import { useState } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ProfitLoss({ data, filters }: { data: any, filters: any }) {
    const [startDate, setStartDate] = useState(filters.start_date)
    const [endDate, setEndDate] = useState(filters.end_date)

    const handleFilter = () => {
        router.get('/accounting/reports/profit-loss', { start_date: startDate, end_date: endDate }, { preserveState: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Accounting", href: "/accounting" }, { title: "Reports", href: "/accounting/reports/profit-loss" }, { title: "Profit & Loss" }]}>
            <Head title="Profit & Loss" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Profit & Loss</h2>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
                        <Button onClick={handleFilter}>Filter</Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader><CardTitle>Income</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {data.income.map((acc: any) => (
                                        <TableRow key={acc.id}>
                                            <TableCell>{acc.code} - {acc.name}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(acc.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Total Income</TableCell>
                                        <TableCell className="text-right text-green-600">{formatCurrency(data.total_income)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {data.expense.map((acc: any) => (
                                        <TableRow key={acc.id}>
                                            <TableCell>{acc.code} - {acc.name}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(acc.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Total Expenses</TableCell>
                                        <TableCell className="text-right text-red-600">{formatCurrency(data.total_expense)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/20">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Net Income</span>
                                <span className={data.net_income >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatCurrency(data.net_income)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
