import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { router } from '@inertiajs/react'
import { Switch } from '@/components/ui/switch'

interface ChartOfAccount {
    id: number
    code: string
    name: string
}

interface PostingRuleLine {
    id?: number
    chart_of_account_id: string | number
    debit_credit: 'debit' | 'credit'
    amount_key: string
    description_template?: string
}

interface PostingRule {
    id: number
    event_type: string
    description: string
    module: string
    is_active: boolean
    lines: PostingRuleLine[]
}

interface PostingRuleFormData {
    event_type: string
    description: string
    module: string
    is_active: boolean
    lines: PostingRuleLine[]
}

interface Props {
    rule: PostingRule
    chartOfAccounts: ChartOfAccount[]
    modules: string[]
    amountKeys: Record<string, string>
}

export default function Edit({ rule, chartOfAccounts, modules, amountKeys }: Props) {
    const { data, setData, put, processing, errors } = useForm<PostingRuleFormData>({
        event_type: rule.event_type,
        description: rule.description,
        module: rule.module,
        is_active: rule.is_active,
        lines: (rule.lines || []).map(l => ({
            chart_of_account_id: String(l.chart_of_account_id),
            debit_credit: l.debit_credit,
            amount_key: l.amount_key,
            description_template: l.description_template
        }))
    })

    const updateLine = (index: number, field: string, value: any) => {
        const updatedLines = [...data.lines]
        updatedLines[index] = { ...updatedLines[index], [field]: value }
        setData('lines', updatedLines)
    }

    const addLine = () => {
        setData('lines', [...data.lines, { 
            chart_of_account_id: '', 
            debit_credit: 'debit', 
            amount_key: 'total_amount' 
        }])
    }

    const removeLine = (index: number) => {
        if (data.lines.length <= 2) return
        setData('lines', data.lines.filter((_, i) => i !== index))
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/accounting/posting-rules/${rule.id}`)
    }

    return (
        <AppLayout>
            <Head title={`Edit Posting Rule - ${rule.event_type}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Edit Posting Rule`}
                    description={rule.event_type}
                >
                    <Button variant="outline" onClick={() => router.visit('/accounting/posting-rules')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Rules
                    </Button>
                </PageHeader>

                <form onSubmit={submit}>
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="event_type">Event Type</Label>
                                    <Input 
                                        id="event_type" 
                                        value={data.event_type}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">Event type cannot be changed</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="module">Module</Label>
                                    <Select value={data.module} onValueChange={val => setData('module', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modules.map(mod => (
                                                <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Rule Description</Label>
                                <Input 
                                    id="description" 
                                    placeholder="Explain what this rule does..." 
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="is_active" 
                                    checked={data.is_active}
                                    onCheckedChange={val => setData('is_active', val)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (Rule is {data.is_active ? 'enabled' : 'disabled'})
                                </Label>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-bold">Transaction Lines</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addLine}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Line
                                    </Button>
                                </div>

                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-[40%]">Account</TableHead>
                                                <TableHead className="w-[15%]">D/C</TableHead>
                                                <TableHead className="w-[20%]">Amount Key</TableHead>
                                                <TableHead className="w-[20%]">Narration Template</TableHead>
                                                <TableHead className="w-[5%]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.lines.map((line, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="py-2">
                                                        <Select 
                                                            value={String(line.chart_of_account_id)} 
                                                            onValueChange={val => updateLine(index, 'chart_of_account_id', val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Select account..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {chartOfAccounts.map(acc => (
                                                                    <SelectItem key={acc.id} value={String(acc.id)}>
                                                                        {acc.code} - {acc.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <Select 
                                                            value={line.debit_credit} 
                                                            onValueChange={val => updateLine(index, 'debit_credit', val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs font-bold uppercase">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="debit">DEBIT</SelectItem>
                                                                <SelectItem value="credit">CREDIT</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <Select 
                                                            value={line.amount_key} 
                                                            onValueChange={val => updateLine(index, 'amount_key', val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(amountKeys).map(([key, label]) => (
                                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <Input 
                                                            className="h-8 text-xs" 
                                                            placeholder="{invoice_no}" 
                                                            value={line.description_template || ''}
                                                            onChange={e => updateLine(index, 'description_template', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeLine(index)}
                                                            disabled={data.lines.length <= 2}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {errors.lines && <p className="text-xs text-destructive">{errors.lines}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.visit('/accounting/posting-rules')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Rule
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    )
}
