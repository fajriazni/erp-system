import { useState, useEffect } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, useForm, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Plus, ArrowLeft, Save } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface JournalEntryLine {
    id?: number
    chart_of_account_id: string
    debit: number
    credit: number
}

interface ChartOfAccount {
    id: number
    name: string
    type: string
}

export default function Create({ chartOfAccounts }: { chartOfAccounts: ChartOfAccount[] }) {
    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        currency_code: 'USD',
        exchange_rate: 1.0,
        lines: [
            { chart_of_account_id: '', debit: 0, credit: 0 },
            { chart_of_account_id: '', debit: 0, credit: 0 },
        ] as JournalEntryLine[],
    })

    const addLine = () => {
        setData('lines', [
            ...data.lines,
            { chart_of_account_id: '', debit: 0, credit: 0 },
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
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isBalanced) {
            toast.error("Journal Entry is not balanced.")
            return
        }
        post('/accounting/journal-entries')
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Journal Entries", href: "/accounting/journal-entries" },
                { title: "Create", href: "/accounting/journal-entries/create" },
            ]}
        >
            <Head title="Create Journal Entry" />

            <form onSubmit={submit} className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">New Journal Entry</h2>
                        <p className="text-muted-foreground">
                            Create a new manual journal entry.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/accounting/journal-entries">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Draft
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>
                            General information about the transaction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                required
                            />
                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="currency_code">Currency</Label>
                             <div className="flex space-x-2">
                                <Input
                                    id="currency_code"
                                    value={data.currency_code}
                                    onChange={e => setData('currency_code', e.target.value.toUpperCase())}
                                    placeholder="USD"
                                    maxLength={3}
                                    className="w-24"
                                />
                                <Input
                                    type="number"
                                    step="0.000001"
                                    value={data.exchange_rate}
                                    onChange={e => setData('exchange_rate', parseFloat(e.target.value) || 0)}
                                    placeholder="Rate"
                                    className="flex-1"
                                />
                             </div>
                             {errors.currency_code && <p className="text-sm text-red-500">{errors.currency_code}</p>}
                             {errors.exchange_rate && <p className="text-sm text-red-500">{errors.exchange_rate}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="e.g. Monthly Accrual"
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Journal Lines</CardTitle>
                            <CardDescription>
                                Add debit and credit lines.
                            </CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addLine}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Line
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50 border-b">
                                <div className="col-span-6">Account</div>
                                <div className="col-span-2 text-right">Debit</div>
                                <div className="col-span-2 text-right">Credit</div>
                                <div className="col-span-2"></div>
                            </div>
                            {data.lines.map((line, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 p-4 items-start border-b last:border-0 hover:bg-muted/10 transition-colors">
                                    <div className="col-span-6 space-y-1">
                                         <AccountSelect
                                            accounts={chartOfAccounts}
                                            value={line.chart_of_account_id}
                                            onChange={(val) => updateLine(index, 'chart_of_account_id', val)}
                                        />
                                        {errors[`lines.${index}.chart_of_account_id`] && (
                                            <p className="text-xs text-red-500">
                                                {errors[`lines.${index}.chart_of_account_id`]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={line.debit}
                                            onChange={e => updateLine(index, 'debit', e.target.value)}
                                            className="text-right"
                                            onFocus={(e) => e.target.select()}
                                            disabled={parseFloat(String(line.credit)) > 0}
                                        />
                                        {errors[`lines.${index}.debit`] && <p className="text-xs text-red-500">{errors[`lines.${index}.debit`]}</p>}
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={line.credit}
                                            onChange={e => updateLine(index, 'credit', e.target.value)}
                                            className="text-right"
                                            onFocus={(e) => e.target.select()}
                                            disabled={parseFloat(String(line.debit)) > 0}
                                        />
                                        {errors[`lines.${index}.credit`] && <p className="text-xs text-red-500">{errors[`lines.${index}.credit`]}</p>}
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-red-500"
                                            onClick={() => removeLine(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                         <div className="flex justify-end space-x-8 px-4 py-2 border rounded-md bg-muted/20">
                            <div className="text-sm font-medium">Total:</div>
                            <div className={cn("text-sm font-bold w-24 text-right", !isBalanced && "text-red-500")}>
                                {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className={cn("text-sm font-bold w-24 text-right", !isBalanced && "text-red-500")}>
                                {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="w-10"></div>
                        </div>
                        {!isBalanced && (
                             <p className="text-sm text-red-500 text-right">
                                Debit and Credit must be equal. Difference: {Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                             </p>
                        )}
                    </CardContent>
                </Card>
            </form>
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
                    className="w-full justify-between font-normal"
                >
                    {selectedAccount
                        ? selectedAccount.name
                        : "Select account..."}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search account..." />
                    <CommandList>
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                            {accounts.map((account) => (
                                <CommandItem
                                    key={account.id}
                                    value={account.name}
                                    onSelect={() => {
                                        onChange(String(account.id))
                                        setOpen(false)
                                    }}
                                >
                                    {account.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
