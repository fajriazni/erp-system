import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { FileDown } from "lucide-react"
import { ReportFilters } from "@/components/accounting/ReportFilters"

interface AccountingPeriod {
    id: number
    name: string
    start_date: string
    end_date: string
    status: string
}

interface AccountItem {
    account_id: number
    account_code: string
    account_name: string
    balance: number
}

interface ReportData {
    as_of_date: string
    assets: {
        current: AccountItem[]
        non_current: AccountItem[]
        total: number
    }
    liabilities: {
        current: AccountItem[]
        non_current: AccountItem[]
        total: number
    }
    equity: {
        items: AccountItem[]
        total: number
    }
    total_liabilities_and_equity: number
    is_balanced: boolean
    working_capital: number
}

interface Props {
    periods?: AccountingPeriod[]
    filters?: {
        as_of_date?: string
    }
    reportData?: ReportData | null
}

export default function BalanceSheet(props: Props) {
    const { periods = [], filters = {}, reportData = null } = props;

    const AccountSection = ({ title, accounts, total }: { title: string, accounts: AccountItem[], total: number }) => (
        <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">{title}</h4>
            <Table>
                <TableBody>
                    {accounts.map((acc) => (
                        <TableRow key={acc.account_id}>
                            <TableCell className="font-mono text-xs">{acc.account_code}</TableCell>
                            <TableCell>{acc.account_name}</TableCell>
                            <TableCell className="text-right">
                                Rp {acc.balance.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>Total {title}</TableCell>
                        <TableCell className="text-right">
                            Rp {total.toLocaleString()}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Reports", href: "#" },
                { title: "Balance Sheet", href: "#" },
            ]}
        >
            <Head title="Balance Sheet" />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <PageHeader
                    title="Balance Sheet"
                    description="Assets, Liabilities, and Equity as of a specific date"
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
                    reportUrl="/accounting/reports/balance-sheet"
                    filterType="single-date"
                    initialFilters={filters}
                />

                {/* Report Data */}
                {reportData ? (
                    <>
                        {/* Header Info */}
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <p className="text-sm text-muted-foreground">As of Date</p>
                                <p className="font-semibold">{new Date(reportData.as_of_date).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Working Capital</p>
                                <p className="font-semibold">Rp {reportData.working_capital.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className={`font-semibold ${reportData.is_balanced ? 'text-green-600' : 'text-red-600'}`}>
                                    {reportData.is_balanced ? '✓ Balanced' : '✗ Not Balanced'}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Assets Column */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>ASSETS</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {reportData.assets.current.length > 0 && (
                                        <AccountSection 
                                            title="Current Assets" 
                                            accounts={reportData.assets.current} 
                                            total={reportData.assets.current.reduce((sum, a) => sum + a.balance, 0)}
                                        />
                                    )}
                                    {reportData.assets.non_current.length > 0 && (
                                        <AccountSection 
                                            title="Non-Current Assets" 
                                            accounts={reportData.assets.non_current} 
                                            total={reportData.assets.non_current.reduce((sum, a) => sum + a.balance, 0)}
                                        />
                                    )}
                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>TOTAL ASSETS</span>
                                            <span>Rp {reportData.assets.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Liabilities & Equity Column */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>LIABILITIES & EQUITY</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Liabilities */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Liabilities</h3>
                                        {reportData.liabilities.current.length > 0 && (
                                            <AccountSection 
                                                title="Current Liabilities" 
                                                accounts={reportData.liabilities.current} 
                                                total={reportData.liabilities.current.reduce((sum, a) => sum + a.balance, 0)}
                                            />
                                        )}
                                        {reportData.liabilities.non_current.length > 0 && (
                                            <AccountSection 
                                                title="Non-Current Liabilities" 
                                                accounts={reportData.liabilities.non_current} 
                                                total={reportData.liabilities.non_current.reduce((sum, a) => sum + a.balance, 0)}
                                            />
                                        )}
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>Total Liabilities</span>
                                            <span>Rp {reportData.liabilities.total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Equity */}
                                    {reportData.equity.items.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="font-semibold">Equity</h3>
                                            <AccountSection 
                                                title="" 
                                                accounts={reportData.equity.items} 
                                                total={reportData.equity.total}
                                            />
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>TOTAL LIABILITIES & EQUITY</span>
                                            <span>Rp {reportData.total_liabilities_and_equity.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Select a date and click "Generate Report" to view the Balance Sheet
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
