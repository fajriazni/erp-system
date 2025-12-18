import { useState } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

export default function BalanceSheet({ data, filters }: { data: any, filters: any }) {
    const [date, setDate] = useState(filters.date)

    const handleFilter = () => {
        router.get('/accounting/reports/balance-sheet', { date }, { preserveState: true })
    }

    const AccountSection = ({ title, accounts, total }: { title: string, accounts: any[], total: number }) => (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {accounts.map((acc: any) => (
                            <TableRow key={acc.id}>
                                <TableCell>{acc.code} - {acc.name}</TableCell>
                                <TableCell className="text-right">{formatCurrency(acc.amount)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total {title}</TableCell>
                            <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    return (
        <AppLayout breadcrumbs={[{ title: "Accounting", href: "/accounting" }, { title: "Reports", href: "/accounting/reports/balance-sheet" }, { title: "Balance Sheet" }]}>
            <Head title="Balance Sheet" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Balance Sheet</h2>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
                        <Button onClick={handleFilter}>Filter</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <AccountSection title="Assets" accounts={data.assets} total={data.total_assets} />
                    </div>
                    <div className="space-y-6">
                        <AccountSection title="Liabilities" accounts={data.liabilities} total={data.total_liabilities} />
                        <AccountSection title="Equity" accounts={data.equity} total={data.total_equity} />
                        
                        <Card className="bg-muted/20">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center font-bold">
                                    <span>Total Liabilities & Equity</span>
                                    <span>{formatCurrency(data.total_liabilities_equity)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
