import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { FileDown, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReportFilters } from "@/components/accounting/ReportFilters"

interface AccountingPeriod {
    id: number
    name: string
    start_date: string
    end_date: string
    status: string
}

interface AccountBalance {
    account_id: number
    account_code: string
    account_name: string
    account_type: string
    debit: number
    credit: number
}

interface ReportData {
    as_of_date: string
    accounts: AccountBalance[]
    total_debit: number
    total_credit: number
    is_balanced: boolean
    difference: number
}

interface Props {
    periods?: AccountingPeriod[]
    filters?: {
        as_of_date?: string
        period_id?: number
    }
    reportData?: ReportData | null
}

export default function TrialBalance(props: Props) {
    const { periods = [], filters = {}, reportData = null } = props

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Reports", href: "#" },
                { title: "Trial Balance", href: "#" },
            ]}
        >
            <Head title="Trial Balance" />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <PageHeader
                    title="Trial Balance"
                    description="Verify account balances as of a specific date"
                >
                    {reportData && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <FileDown className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                            <Button variant="outline" size="sm">
                                <FileDown className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </div>
                    )}
                </PageHeader>

                {/* Filters with Toggle Mode */}
                <ReportFilters
                    periods={periods}
                    reportUrl="/accounting/reports/trial-balance"
                    filterType="single-date"
                    initialFilters={filters}
                />

                {/* Report Data */}
                {reportData ? (
                    <>
                        {/* Balance Status Alert */}
                        {reportData.is_balanced ? (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Trial Balance is Balanced</AlertTitle>
                                <AlertDescription>
                                    Total Debits = Total Credits (Rp {reportData.total_debit.toLocaleString()})
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Trial Balance is NOT Balanced</AlertTitle>
                                <AlertDescription>
                                    Difference: Rp {Math.abs(reportData.difference).toLocaleString()}
                                    {reportData.difference > 0 ? " (Debit exceeds Credit)" : " (Credit exceeds Debit)"}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Main Report */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Trial Balance as of {new Date(reportData.as_of_date).toLocaleDateString('id-ID')}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account Code</TableHead>
                                            <TableHead>Account Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Debit</TableHead>
                                            <TableHead className="text-right">Credit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.accounts.map((account) => (
                                            <TableRow key={account.account_id}>
                                                <TableCell className="font-mono text-xs">{account.account_code}</TableCell>
                                                <TableCell>{account.account_name}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground capitalize">
                                                    {account.account_type}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {account.debit > 0 ? `Rp ${account.debit.toLocaleString()}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {account.credit > 0 ? `Rp ${account.credit.toLocaleString()}` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-muted/50 font-bold">
                                            <TableCell colSpan={3}>TOTAL</TableCell>
                                            <TableCell className="text-right">
                                                Rp {reportData.total_debit.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                Rp {reportData.total_credit.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Select a date and click "Generate Report" to view the Trial Balance
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
