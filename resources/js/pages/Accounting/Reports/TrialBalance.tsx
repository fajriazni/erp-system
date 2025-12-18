import { useState } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TrialBalance({ data, filters }: { data: any[], filters: any }) {
    const [date, setDate] = useState(filters.date)

    const handleFilter = () => {
        router.get('/accounting/reports/trial-balance', { date }, { preserveState: true })
    }

    const totalDebit = data.reduce((sum, item) => sum + item.debit, 0)
    const totalCredit = data.reduce((sum, item) => sum + item.credit, 0)

    return (
        <AppLayout breadcrumbs={[{ title: "Accounting", href: "/accounting" }, { title: "Reports", href: "/accounting/reports/trial-balance" }, { title: "Trial Balance" }]}>
            <Head title="Trial Balance" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Trial Balance</h2>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-40"
                        />
                        <Button onClick={handleFilter}>Filter</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>As of {new Date(filters.date).toLocaleDateString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell>{account.code}</TableCell>
                                        <TableCell>{account.name}</TableCell>
                                        <TableCell className="text-right">
                                            {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell colSpan={2}>Total</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
