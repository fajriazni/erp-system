import { useState, useEffect } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, useForm, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, ArrowLeft, Save, AlertCircle, CheckCircle2, Info } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface JournalEntryLine {
    id?: number
    chart_of_account_id: string | number
    debit: string | number
    credit: string | number
    description?: string
}

interface ChartOfAccount {
    id: number
    name: string
    code: string
    type: string
}

interface JournalEntry {
    id: number
    reference_number: string
    date: string
    description: string
    currency_code: string
    exchange_rate: string | number
    status: string
    lines: JournalEntryLine[]
}

export default function Edit({ entry, chartOfAccounts }: { entry: JournalEntry, chartOfAccounts: ChartOfAccount[] }) {
    const { data, setData, patch, processing, errors } = useForm({
        date: entry.date.split('T')[0],
        description: entry.description || '',
        currency_code: entry.currency_code || 'USD',
        exchange_rate: entry.exchange_rate || 1.0,
        lines: entry.lines.map(line => ({
            chart_of_account_id: String(line.chart_of_account_id),
            debit: Number(line.debit),
            credit: Number(line.credit),
            description: line.description || ''
        })) as JournalEntryLine[],
    })

    const addLine = () => {
        setData('lines', [
            ...data.lines,
            { chart_of_account_id: '', debit: 0, credit: 0, description: '' },
        ])
    }

    const removeLine = (index: number) => {
        if (data.lines.length <= 2) {
            toast.error("A journal entry must have at least 2 lines.")
            return
        }
        const newLines = [...data.lines]
        newLines.splice(index, 1)
        setData('lines', newLines)
    }

    const updateLine = (index: number, field: keyof JournalEntryLine, value: any) => {
        const newLines = [...data.lines]
        newLines[index] = { ...newLines[index], [field]: value }
        setData('lines', newLines)
    }

    const totalDebit = data.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0)
    const difference = Math.abs(totalDebit - totalCredit)
    const isBalanced = difference < 0.01 && (totalDebit > 0 || totalCredit > 0)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isBalanced) {
            toast.error("Journal Entry is not balanced.")
            return
        }
        patch(`/accounting/journal-entries/${entry.id}`)
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Journal Entries", href: "/accounting/journal-entries" },
                { title: "Edit", href: "#" },
            ]}
        >
            <Head title={`Edit Journal Entry - ${entry.reference_number}`} />

            <div className="flex flex-1 flex-col gap-6 pt-0">
                <form onSubmit={submit} className="space-y-6">
                    <PageHeader
                        title={`Edit ${entry.reference_number}`}
                        description={entry.description || 'Update journal entry details.'}
                        className="mb-8"
                    >
                         <div className="flex items-center gap-2">
                            <Button variant="outline" asChild size="sm">
                                <Link href="/accounting/journal-entries">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to List
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing} size="sm">
                                <Save className="mr-2 h-4 w-4" />
                                Update Entry
                            </Button>
                        </div>
                    </PageHeader>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                Please check the form for errors. Ensure all lines have an account and are balanced.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">General Information</CardTitle>
                                <div className="text-xs font-mono text-muted-foreground">
                                    REF: {entry.reference_number}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Posting Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    required
                                    className=""
                                />
                                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency_code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Currency</Label>
                                <Input
                                    id="currency_code"
                                    value={data.currency_code}
                                    onChange={e => setData('currency_code', e.target.value.toUpperCase())}
                                    placeholder="USD"
                                    maxLength={3}
                                    className="uppercase font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="exchange_rate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rate</Label>
                                <Input
                                    id="exchange_rate"
                                    type="number"
                                    step="0.000001"
                                    value={data.exchange_rate}
                                    onChange={e => setData('exchange_rate', e.target.value)}
                                    className="font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Header Narration</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Overall purpose or summary..."
                                    className=""
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-1 bg-primary rounded-full" />
                                <div>
                                    <CardTitle className="text-lg">Journal Lines</CardTitle>
                                    <CardDescription>Select accounts and enter amounts.</CardDescription>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {isBalanced ? (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Balanced
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        <Info className="mr-1 h-3 w-3" /> Unbalanced: {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[45%] pl-6">Account & Narration</TableHead>
                                        <TableHead className="w-[20%] text-right">Debit</TableHead>
                                        <TableHead className="w-[20%] text-right">Credit</TableHead>
                                        <TableHead className="w-[10%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.lines.map((line, index) => (
                                        <TableRow key={index} className="group align-top hover:bg-muted/5 border-muted/40">
                                            <TableCell className="pl-6 py-4">
                                                <div className="space-y-2">
                                                    <AccountSelect
                                                        accounts={chartOfAccounts}
                                                        value={String(line.chart_of_account_id)}
                                                        onChange={(val) => updateLine(index, 'chart_of_account_id', val)}
                                                    />
                                                    <Input
                                                        placeholder="Line description (optional)"
                                                        value={line.description}
                                                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                        className="h-9 text-sm"
                                                    />
                                                    {errors[`lines.${index}.chart_of_account_id`] && (
                                                        <p className="text-[10px] text-destructive font-medium uppercase tracking-tight">
                                                            Required field
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={line.debit}
                                                    onChange={e => updateLine(index, 'debit', e.target.value)}
                                                    className="text-right font-mono"
                                                    onFocus={(e) => e.target.select()}
                                                    disabled={Number(line.credit) > 0}
                                                />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={line.credit}
                                                    onChange={e => updateLine(index, 'credit', e.target.value)}
                                                    className="text-right font-mono"
                                                    onFocus={(e) => e.target.select()}
                                                    disabled={Number(line.debit) > 0}
                                                />
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                    onClick={() => removeLine(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4 bg-muted/5 border-t border-muted/40 flex justify-between items-center">
                                <Button type="button" variant="outline" size="sm" onClick={addLine} className="border-dashed hover:border-solid hover:bg-primary/5 transition-all">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Another Line
                                </Button>
                                
                                <div className="flex gap-8 items-center text-sm">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Total Debit</span>
                                        <span className={cn("font-mono font-bold text-base", !isBalanced ? "text-amber-600" : "text-emerald-600")}>
                                            {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Total Credit</span>
                                        <span className={cn("font-mono font-bold text-base", !isBalanced ? "text-amber-600" : "text-emerald-600")}>
                                            {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                     {isBalanced && (
                        <Alert className="bg-emerald-50/50 border-emerald-200 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <AlertDescription className="text-xs font-medium">
                                Perfect! The journal entry is balanced and ready to be updated.
                            </AlertDescription>
                        </Alert>
                    )}
                </form>
            </div>
        </AppLayout>
    )
}

function AccountSelect({ accounts, value, onChange }: { accounts: ChartOfAccount[], value: string, onChange: (val: string) => void }) {
    const [open, setOpen] = useState(false)
    const selectedAccount = accounts.find((account) => String(account.id) === String(value))

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between bg-background",
                        !value && "text-muted-foreground"
                    )}
                >
                    <span className="truncate">
                        {selectedAccount
                            ? `${selectedAccount.code} - ${selectedAccount.name}`
                            : "Select account..."}
                    </span>
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 shadow-xl border-muted/40" align="start">
                <Command>
                    <div className="flex items-center border-b px-3">
                        <CommandInput placeholder="Search by name or code..." className="h-10 border-none focus:ring-0" />
                    </div>
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup className="p-2">
                            {accounts.map((account) => (
                                <CommandItem
                                    key={account.id}
                                    value={`${account.code} ${account.name}`}
                                    onSelect={() => {
                                        onChange(String(account.id))
                                        setOpen(false)
                                    }}
                                    className="flex items-center justify-between rounded-md px-3 py-2 cursor-pointer hover:bg-primary/10 data-[selected=true]:bg-primary/10 transition-colors"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-mono font-bold text-primary tracking-tight">{account.code}</span>
                                        <span className="text-sm font-medium">{account.name}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-4 bg-muted/50 font-normal uppercase tracking-tighter opacity-70">
                                        {account.type}
                                    </Badge>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
