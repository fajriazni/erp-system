import { useState, useMemo } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, useForm, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { 
    Plus, 
    Trash2, 
    Save, 
    AlertCircle, 
    Calculator,
    ArrowRight,
    Search,
    RefreshCw,
    CheckCircle2,
    Info
} from "lucide-react"
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ChartOfAccount {
    id: number
    name: string
    code: string
    type: string
}

interface BalanceLine {
    chart_of_account_id: string | number
    amount: number | string
    type: 'debit' | 'credit'
}

interface ExistingBalance {
    id: number
    date: string
    description: string
    status: string
    total_debit: number
    total_credit: number
    lines_count: number
}

export default function BeginningBalance({ 
    chartOfAccounts,
    periods,
    existingBalances = []
}: { 
    chartOfAccounts: ChartOfAccount[]
    periods: any[]
    existingBalances?: ExistingBalance[]
}) {
    const [searchQuery, setSearchQuery] = useState("")

    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().split('T')[0],
        balances: [] as BalanceLine[]
    })

    const filteredAccounts = useMemo(() => {
        return chartOfAccounts.filter(acc => 
            acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            acc.code.includes(searchQuery)
        )
    }, [chartOfAccounts, searchQuery])

    const toggleAccount = (account: ChartOfAccount) => {
        const index = data.balances.findIndex(b => String(b.chart_of_account_id) === String(account.id))
        if (index > -1) {
            const newBalances = [...data.balances]
            newBalances.splice(index, 1)
            setData('balances', newBalances)
        } else {
            // Default type based on account type
            const type = ['asset', 'expense'].some(t => account.type.toLowerCase().includes(t)) ? 'debit' : 'credit'
            setData('balances', [
                ...data.balances,
                { chart_of_account_id: account.id, amount: 0, type }
            ])
        }
    }

    const updateBalance = (id: number, field: keyof BalanceLine, value: any) => {
        const newBalances = data.balances.map(b => 
            String(b.chart_of_account_id) === String(id) ? { ...b, [field]: value } : b
        )
        setData('balances', newBalances)
    }

    const totals = useMemo(() => {
        return data.balances.reduce((acc, line) => {
            const amount = parseFloat(String(line.amount)) || 0
            if (line.type === 'debit') acc.debit += amount
            else acc.credit += amount
            return acc
        }, { debit: 0, credit: 0 })
    }, [data.balances])

    const difference = Math.abs(totals.debit - totals.credit)
    const isBalanced = difference < 0.01 && (totals.debit > 0 || totals.credit > 0)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (data.balances.length === 0) {
            toast.error("Please add at least one account balance.")
            return
        }
        if (!isBalanced) {
            toast.error("The entries must be balanced (Total Debit = Total Credit).")
            return
        }
        post('/accounting/beginning-balance', {
            onSuccess: () => toast.success("Beginning balances recorded")
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Openings", href: "#" },
                { title: "Beginning Balance", href: "#" },
            ]}
        >
            <Head title="Beginning Balance Wizard" />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                {/* Existing Balances Warning */}
                {existingBalances.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <CardTitle className="text-base text-amber-900">
                                            {existingBalances.length} Beginning Balance {existingBalances.length === 1 ? 'Entry' : 'Entries'} Already Exist
                                        </CardTitle>
                                        <CardDescription className="text-amber-700 mt-1">
                                            Last entry: {new Date(existingBalances[0].date).toLocaleDateString()} 
                                            {' '}(Rp {existingBalances[0].total_debit.toLocaleString()})
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild className="border-amber-300 hover:bg-amber-100">
                                    <Link href={`/accounting/journal-entries`}>View All Entries</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="space-y-2">
                                {existingBalances.map((balance) => (
                                    <div key={balance.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    {new Date(balance.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-sm font-medium">{balance.description}</span>
                                                <Badge variant="outline" className="text-xs">{balance.status}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                <span>Debit: Rp {balance.total_debit.toLocaleString()}</span>
                                                <span>Credit: Rp {balance.total_credit.toLocaleString()}</span>
                                                <span>{balance.lines_count} lines</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/accounting/journal-entries`}>
                                                View Details
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={submit}>
                    <PageHeader
                        title="Beginning Balance Wizard"
                        description="Set the opening balances for your chart of accounts to start a new fiscal year or migrate data."
                    >
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild size="sm">
                                <Link href="/accounting/journal-entries">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} size="sm">
                                <Save className="mr-2 h-4 w-4" />
                                Record Balances
                            </Button>
                        </div>
                    </PageHeader>

                    <div className="grid gap-6 lg:grid-cols-3 mt-6">
                        {/* Selector Sidebar */}
                        <Card className="lg:col-span-1 h-fit shadow-sm sticky top-6">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>Select Accounts</span>
                                    <Badge variant="outline" className="font-mono text-[10px]">{data.balances.length} selected</Badge>
                                </CardTitle>
                                <div className="relative mt-2">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by code or name..."
                                        className="pl-9 h-9"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 border-t">
                                <div className="max-h-[500px] overflow-y-auto p-2 space-y-1">
                                    {filteredAccounts.map(acc => {
                                        const isSelected = data.balances.some(b => String(b.chart_of_account_id) === String(acc.id))
                                        return (
                                            <button
                                                key={acc.id}
                                                type="button"
                                                onClick={() => toggleAccount(acc)}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 rounded-md transition-all flex items-center justify-between group",
                                                    isSelected 
                                                        ? "bg-primary/10 text-primary border-primary/20 border shadow-sm" 
                                                        : "hover:bg-muted border border-transparent"
                                                )}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-mono font-bold opacity-70">{acc.code}</span>
                                                    <span className="text-sm font-medium leading-tight">{acc.name}</span>
                                                </div>
                                                {isSelected ? (
                                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                ) : (
                                                    <Plus className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Editor Main */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Opening Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Opening Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={e => setData('date', e.target.value)}
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            Usually the last day of the previous period or the first day of the new fiscal year.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm overflow-hidden border-none shadow-md">
                                <CardHeader className="bg-primary/5 py-3 flex flex-row items-center justify-between border-b">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5 text-primary" />
                                        <h3 className="font-bold">Opening Balances Sheet</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isBalanced ? (
                                             <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase font-bold text-[10px] tracking-widest px-3">
                                                 Balanced
                                             </Badge>
                                        ) : (
                                             <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase font-bold text-[10px] tracking-widest px-3">
                                                 Unbalanced: {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                             </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {data.balances.length === 0 ? (
                                        <div className="py-20 text-center flex flex-col items-center gap-2">
                                            <Calculator className="h-12 w-12 text-muted-foreground/30" />
                                            <p className="text-muted-foreground font-medium">No accounts selected yet.</p>
                                            <p className="text-sm text-muted-foreground/60">Select accounts from the left panel to start entry.</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow>
                                                    <TableHead className="pl-6">Account</TableHead>
                                                    <TableHead className="w-[120px]">Type</TableHead>
                                                    <TableHead className="text-right w-[180px]">Amount</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.balances.map((line) => {
                                                    const account = chartOfAccounts.find(a => String(a.id) === String(line.chart_of_account_id))
                                                    return (
                                                        <TableRow key={line.chart_of_account_id} className="hover:bg-muted/10 group">
                                                            <TableCell className="pl-6 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-mono text-[10px] font-bold text-primary">{account?.code}</span>
                                                                    <span className="font-medium">{account?.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select 
                                                                    value={line.type} 
                                                                    onValueChange={val => updateBalance(Number(line.chart_of_account_id), 'type', val)}
                                                                >
                                                                    <SelectTrigger className="h-8 text-[10px] font-bold uppercase tracking-tight">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="debit">DEBIT</SelectItem>
                                                                        <SelectItem value="credit">CREDIT</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input 
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="text-right font-mono h-9"
                                                                    value={line.amount}
                                                                    onChange={e => updateBalance(Number(line.chart_of_account_id), 'amount', e.target.value)}
                                                                    onFocus={e => e.target.select()}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="pr-6">
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                                                    onClick={() => toggleAccount(account!)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                            <TableFooter className="bg-muted/10 border-t-2">
                                                <TableRow>
                                                    <TableCell colSpan={2} className="pl-6 text-right font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                                                        Total Balanced Check
                                                    </TableCell>
                                                    <TableCell className="text-right py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex justify-between items-center text-xs opacity-70">
                                                                <span>Total Debit:</span>
                                                                <span className="font-mono">{totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs opacity-70">
                                                                <span>Total Credit:</span>
                                                                <span className="font-mono">{totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <Separator />
                                                            <div className={cn(
                                                                "flex justify-between items-center font-bold",
                                                                isBalanced ? "text-emerald-600" : "text-amber-600"
                                                            )}>
                                                                <span>Difference:</span>
                                                                <span className="font-mono">{difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
