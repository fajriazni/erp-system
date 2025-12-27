import { Head, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Settings2, Trash2 } from 'lucide-react'

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

interface ChartOfAccount {
    id: number
    name: string
    code: string
}

export default function PostingRules({ 
    rules, 
    chartOfAccounts, 
}: { 
    rules: PostingRule[]
    chartOfAccounts: ChartOfAccount[] 
}) {
    const deleteRule = (id: number) => {
        if (!confirm('Are you sure you want to delete this posting rule?')) return
        router.delete(`/accounting/posting-rules/${id}`)
    }

    const modules = ['Sales', 'Purchasing', 'Inventory']

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Settings", href: "#" },
                { title: "Posting Rules", href: "#" },
            ]}
        >
            <Head title="Posting Rules" />

            <div className="space-y-6">
                <PageHeader
                    title="Posting Rules"
                    description="Configure automated journal entry rules for domain events"
                >
                    <Button onClick={() => router.visit('/accounting/posting-rules/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Rule
                    </Button>
                </PageHeader>

                <div className="grid gap-6">
                    {rules.length === 0 ? (
                        <Card className="bg-muted/20 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <Settings2 className="h-10 w-10 text-muted-foreground/40 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">No Posting Rules Found</h3>
                                <p className="text-sm text-muted-foreground/60 max-w-sm mt-1">
                                    Define rules to automate journaling from Sales, Purchasing, and Inventory movements.
                                </p>
                                <Button variant="outline" className="mt-6" onClick={() => router.visit('/accounting/posting-rules/create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Define First Rule
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {modules.map(module => {
                                const moduleRules = rules.filter(r => r.module === module);
                                if (moduleRules.length === 0) return null;
                                
                                return (
                                    <div key={module} className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <h2 className="text-lg font-bold text-foreground">{module}</h2>
                                                <p className="text-xs text-muted-foreground">
                                                    {moduleRules.length} rule{moduleRules.length !== 1 ? 's' : ''} configured
                                                </p>
                                            </div>
                                            <Separator className="flex-1" />
                                        </div>
                                        
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {moduleRules.map(rule => (
                                                <Card key={rule.id} className="group hover:shadow-md transition-all">
                                                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[10px] h-5 font-bold uppercase tracking-wider">
                                                                    {rule.module}
                                                                </Badge>
                                                                {!rule.is_active && (
                                                                    <Badge variant="secondary" className="text-[10px] h-5 opacity-50">Inactive</Badge>
                                                                )}
                                                            </div>
                                                            <CardTitle className="text-sm font-bold truncate max-w-[200px] mt-1">
                                                                {rule.event_type}
                                                            </CardTitle>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.visit(`/accounting/posting-rules/${rule.id}/edit`)}>
                                                                <Settings2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteRule(rule.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">
                                                            {rule.description}
                                                        </p>
                                                        <div className="space-y-2">
                                                            {(rule.lines || []).slice(0, 3).map((line, idx) => (
                                                                <div key={line.id || `line-${idx}`} className="flex items-center justify-between text-[11px] bg-muted/30 p-1.5 rounded border border-transparent hover:border-muted-foreground/20">
                                                                    <span className="font-medium truncate max-w-[150px]">
                                                                        {chartOfAccounts.find(a => a.id === line.chart_of_account_id)?.name || 'Unknown Account'}
                                                                    </span>
                                                                    <Badge variant={line.debit_credit === 'debit' ? 'outline' : 'secondary'} className="text-[9px] h-4 py-0 h-4 border-none uppercase tracking-tighter">
                                                                        {line.debit_credit}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                            {(rule.lines?.length || 0) > 3 && (
                                                                <p className="text-[10px] text-center text-muted-foreground font-medium pt-1">
                                                                    + {(rule.lines?.length || 0) - 3} more lines
                                                                </p>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
