import AppLayout from "@/layouts/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { show } from "@/routes/purchasing/contracts" // Assuming show route works for contract view
import { show as showBPO } from "@/routes/purchasing/blanket-orders" // I'll need to check this path later
import { Badge } from "@/components/ui/badge"

interface ExpiringContract {
    id: number
    type: 'contract' | 'blanket_order'
    reference: string
    vendor_name: string
    end_date: string
    days_remaining: number
}

interface Props {
    expiring: ExpiringContract[]
}

export default function RenewalAlerts({ expiring = [] }: Props) {
    const breadcrumbs = [
        { title: "Purchasing", href: "/purchasing" },
        { title: "Contracts", href: "/purchasing/contracts" },
        { title: "Renewal Alerts", href: "/purchasing/contracts/alerts" },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <PageHeader
                title="Renewal Alerts"
                description="Upcoming contract and blanket order renewals."
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon (30 Days)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiring.filter(e => e.days_remaining <= 30).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">expiring in 30-60 Days</CardTitle>
                        <Clock className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiring.filter(e => e.days_remaining > 30 && e.days_remaining <= 60).length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expiring Contracts & Blanket Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {expiring.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                            No upcoming renewals found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {expiring.map((item) => (
                                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${item.days_remaining <= 30 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Link 
                                                href={item.type === 'contract' ? show(item.id).url : (route('purchasing.blanket-orders.show', item.id))} // Fallback to route() for BPO until I confirm import
                                                className="font-medium hover:underline"
                                            >
                                                {item.reference}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                {item.vendor_name} • {item.type === 'contract' ? 'Purchase Agreement' : 'Blanket Order'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{item.end_date}</div>
                                        <Badge variant={item.days_remaining <= 30 ? "destructive" : "secondary"}>
                                            {item.days_remaining} days left
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    )
}
