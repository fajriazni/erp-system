import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { FileDown, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ReportFilters } from "@/components/accounting/ReportFilters"

interface AccountingPeriod {
    id: number
    name: string
    start_date: string
    end_date: string
    status: string
}

interface CashFlowItem {
    description: string
    amount: number
}

interface ActivitySection {
    items: CashFlowItem[]
    total: number
}

interface ReportData {
    start_date: string
    end_date: string
    operating_activities: ActivitySection & {
        net_income: number
        adjustments: CashFlowItem[]
    }
    investing_activities: ActivitySection
    financing_activities: ActivitySection
    net_cash_flow: number
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

export default function CashFlow(props: Props) {
    const { periods = [], filters = {}, reportData = null } = props

    const CashFlowIcon = ({ amount }: { amount: number }) => {
        if (amount > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
        if (amount < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
        return <Minus className="h-4 w-4 text-gray-400" />
    }

    const ActivityCard = ({ title, section, color }: { title: string, section: ActivitySection, color: string }) => (
        <Card>
            <CardHeader className={color}>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Table>
                    <TableBody>
                        {section.items.map((item, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="flex items-center gap-2">
                                    <CashFlowIcon amount={item.amount} />
                                    {item.description}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    Rp {Math.abs(item.amount).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                            <TableCell>Net Cash from {title}</TableCell>
                            <TableCell className="text-right">
                                Rp {section.total.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Reports", href: "#" },
                { title: "Cash Flow Statement", href: "#" },
            ]}
        >
            <Head title="Cash Flow Statement" />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <PageHeader
                    title="Cash Flow Statement"
                    description="Cash movements across Operating, Investing, and Financing activities"
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
                    reportUrl="/accounting/reports/cash-flow"
                    filterType="date-range"
                    initialFilters={filters}
                />

                {/* Report Data */}
                {reportData ? (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Cash Flow Statement (Indirect Method)
                                    <div className="text-sm font-normal text-muted-foreground mt-1">
                                        Period: {new Date(reportData.start_date).toLocaleDateString('id-ID')} - {new Date(reportData.end_date).toLocaleDateString('id-ID')}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        {/* Operating Activities */}
                        <Card>
                            <CardHeader className="bg-blue-50">
                                <CardTitle className="text-lg">Operating Activities</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Net Income</TableCell>
                                            <TableCell className="text-right font-mono">
                                                Rp {reportData.operating_activities.net_income.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        {reportData.operating_activities.adjustments.length > 0 && (
                                            <>
                                                <TableRow className="bg-muted/30">
                                                    <TableCell colSpan={2} className="font-semibold text-sm">
                                                        Adjustments for non-cash items:
                                                    </TableCell>
                                                </TableRow>
                                                {reportData.operating_activities.adjustments.map((adj, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="pl-8">{adj.description}</TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            Rp {adj.amount.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </>
                                        )}
                                        <TableRow className="bg-blue-100 font-bold">
                                            <TableCell>Net Cash from Operating Activities</TableCell>
                                            <TableCell className="text-right">
                                                Rp {reportData.operating_activities.total.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Investing Activities */}
                        {reportData.investing_activities.items.length > 0 && (
                            <ActivityCard 
                                title="Investing Activities" 
                                section={reportData.investing_activities}
                                color="bg-purple-50"
                            />
                        )}

                        {/* Financing Activities */}
                        {reportData.financing_activities.items.length > 0 && (
                            <ActivityCard 
                                title="Financing Activities" 
                                section={reportData.financing_activities}
                                color="bg-green-50"
                            />
                        )}

                        {/* Net Cash Flow Summary */}
                        <Card className="border-2 border-primary">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between text-xl font-bold">
                                    <span>NET INCREASE/(DECREASE) IN CASH</span>
                                    <span className={reportData.net_cash_flow >= 0 ? "text-green-600" : "text-red-600"}>
                                        Rp {reportData.net_cash_flow.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Select a date range and click "Generate Report" to view the Cash Flow Statement
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
