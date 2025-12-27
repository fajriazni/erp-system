import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
    account_type: string
    amount: number
}

interface ReportData {
    start_date: string
    end_date: string
    revenue: {
        items: AccountItem[]
        total: number
    }
    cost_of_sales: {
        items: AccountItem[]
        total: number
    }
    gross_profit: number
    gross_margin: number
    operating_expenses: {
        items: AccountItem[]
        total: number
    }
    operating_income: number
    net_income: number
    net_margin: number
}

interface Props {
    periods?: AccountingPeriod[]
    filters?: {
        start_date?: string
        end_date?: string
        period_id?: number
    }
    reportData?: ReportData | null
}

export default function ProfitLoss(props: Props) {
    const { periods = [], filters = {}, reportData = null } = props

    const AccountSection = ({ items }: { items: AccountItem[] }) => (
        <>
            {items.map((item) => (
                <TableRow key={item.account_id}>
                    <TableCell className="pl-8 font-mono text-xs">{item.account_code}</TableCell>
                    <TableCell>{item.account_name}</TableCell>
                    <TableCell className="text-right">Rp {item.amount.toLocaleString()}</TableCell>
                </TableRow>
            ))}
        </>
    )

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Profit & Loss", href: "#" },
            ]}
        >
            <Head title="Profit & Loss Statement" />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <PageHeader
                    title="Profit & Loss Statement"
                    description="Income statement for a specific period"
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
                    reportUrl="/accounting/reports/profit-loss"
                    filterType="date-range"
                    initialFilters={filters}
                />

                {/* Report Data */}
                {reportData ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Profit & Loss Statement
                                <div className="text-sm font-normal text-muted-foreground mt-1">
                                    Period: {new Date(reportData.start_date).toLocaleDateString('id-ID')} - {new Date(reportData.end_date).toLocaleDateString('id-ID')}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account Code</TableHead>
                                        <TableHead>Account Name</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Revenue Section */}
                                    <TableRow className="bg-muted/30">
                                        <TableCell colSpan={3} className="font-semibold">REVENUE</TableCell>
                                    </TableRow>
                                    <AccountSection items={reportData.revenue.items} />
                                    <TableRow className="font-semibold bg-muted/50">
                                        <TableCell colSpan={2}>Total Revenue</TableCell>
                                        <TableCell className="text-right">Rp {reportData.revenue.total.toLocaleString()}</TableCell>
                                    </TableRow>

                                    {/* Cost of Sales */}
                                    {reportData.cost_of_sales.items.length > 0 && (
                                        <>
                                            <TableRow className="bg-muted/30">
                                                <TableCell colSpan={3} className="font-semibold">COST OF SALES</TableCell>
                                            </TableRow>
                                            <AccountSection items={reportData.cost_of_sales.items} />
                                            <TableRow className="font-semibold bg-muted/50">
                                                <TableCell colSpan={2}>Total Cost of Sales</TableCell>
                                                <TableCell className="text-right">Rp {reportData.cost_of_sales.total.toLocaleString()}</TableCell>
                                            </TableRow>
                                        </>
                                    )}

                                    {/* Gross Profit */}
                                    <TableRow className="font-bold bg-blue-50">
                                        <TableCell colSpan={2}>
                                            GROSS PROFIT
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                (Margin: {reportData.gross_margin.toFixed(2)}%)
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">Rp {reportData.gross_profit.toLocaleString()}</TableCell>
                                    </TableRow>

                                    {/* Operating Expenses */}
                                    <TableRow className="bg-muted/30">
                                        <TableCell colSpan={3} className="font-semibold">OPERATING EXPENSES</TableCell>
                                    </TableRow>
                                    <AccountSection items={reportData.operating_expenses.items} />
                                    <TableRow className="font-semibold bg-muted/50">
                                        <TableCell colSpan={2}>Total Operating Expenses</TableCell>
                                        <TableCell className="text-right">Rp {reportData.operating_expenses.total.toLocaleString()}</TableCell>
                                    </TableRow>

                                    {/* Operating Income */}
                                    <TableRow className="font-bold bg-green-50">
                                        <TableCell colSpan={2}>OPERATING INCOME</TableCell>
                                        <TableCell className="text-right">Rp {reportData.operating_income.toLocaleString()}</TableCell>
                                    </TableRow>

                                    {/* Net Income */}
                                    <TableRow className="font-bold text-lg bg-primary/10">
                                        <TableCell colSpan={2}>
                                            NET INCOME
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                (Margin: {reportData.net_margin.toFixed(2)}%)
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">Rp {reportData.net_income.toLocaleString()}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Select a date range and click "Generate Report" to view the Profit & Loss Statement
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
