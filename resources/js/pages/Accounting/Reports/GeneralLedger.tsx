import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileDown } from "lucide-react"
import { ReportFilters } from "@/components/accounting/ReportFilters"

interface ChartOfAccount {
    id: number
    code: string
    name: string
    type: string
}

interface AccountingPeriod {
    id: number
    name: string
    start_date: string
    end_date: string
    status: string
}

interface Movement {
    date: string
    journal_entry_id: number
    description: string
    debit: number
    credit: number
    balance: number
}

interface AccountData {
    account_id: number
    account_code: string
    account_name: string
    account_type: string
    beginning_balance: number
    movements: Movement[]
    ending_balance: number
    total_debit: number
    total_credit: number
}

interface Props {
    accounts: ChartOfAccount[]
    periods: AccountingPeriod[]
    filters: {
        account_id?: number
        start_date?: string
        end_date?: string
        period_id?: number
    }
    reportData: AccountData[] | null
}

export default function GeneralLedger({ accounts, periods, filters, reportData }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Reports", href: "#" },
                { title: "General Ledger", href: "#" },
            ]}
        >
            <Head title="General Ledger" />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <PageHeader
                    title="General Ledger Report"
                    description="View detailed account movements and running balances"
                >
                    {reportData && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    const url = new URL(window.location.href)
                                    url.pathname = '/accounting/reports/general-ledger/export'
                                    url.searchParams.set('format', 'pdf')
                                    window.open(url.toString(), '_blank')
                                }}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                    const url = new URL(window.location.href)
                                    url.pathname = '/accounting/reports/general-ledger/export'
                                    url.searchParams.set('format', 'excel')
                                    window.open(url.toString(), '_blank')
                                }}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                            </div>
                    )}
                </PageHeader>

                {/* Filters with Toggle Mode + Account Selector */}
                <ReportFilters
                    periods={periods}
                    reportUrl="/accounting/reports/general-ledger"
                    filterType="date-range"
                    initialFilters={filters}
                    additionalFilters={
                        <div className="space-y-2">
                            <Label htmlFor="account">Account (Optional)</Label>
                            <Select 
                                value={filters.account_id?.toString()} 
                                onValueChange={(val) => {
                                    const url = new URL(window.location.href)
                                    if (val) {
                                        url.searchParams.set('account_id', val)
                                    } else {
                                        url.searchParams.delete('account_id')
                                    }
                                    window.location.href = url.toString()
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All accounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(account => (
                                        <SelectItem key={account.id} value={account.id.toString()}>
                                            {account.code} - {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    }
                />

                {/* Report Data */}
                {reportData && reportData.length > 0 ? (
                    reportData.map(accountData => (
                        <Card key={accountData.account_id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{accountData.account_code} - {accountData.account_name}</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        Type: {accountData.account_type}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Debit</TableHead>
                                            <TableHead className="text-right">Credit</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="bg-muted/50">
                                            <TableCell colSpan={4} className="font-medium">
                                                Beginning Balance
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                Rp {accountData.beginning_balance.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        {accountData.movements.map((movement, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{new Date(movement.date).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>{movement.description}</TableCell>
                                                <TableCell className="text-right">
                                                    {movement.debit > 0 ? `Rp ${movement.debit.toLocaleString()}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {movement.credit > 0 ? `Rp ${movement.credit.toLocaleString()}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    Rp {movement.balance.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-muted/50 font-bold">
                                            <TableCell colSpan={2}>Ending Balance</TableCell>
                                            <TableCell className="text-right">
                                                Rp {accountData.total_debit.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                Rp {accountData.total_credit.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                Rp {accountData.ending_balance.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))
                ) : reportData !== null ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No data found for the selected filters
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </AppLayout>
    )
}
