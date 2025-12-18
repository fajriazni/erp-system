import AppLayout from "@/layouts/app-layout"
import { Head, useForm, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssetCategoriesCreate({ accounts }: { accounts: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        code: "",
        useful_life_years: 0,
        depreciation_method: "straight_line",
        asset_account_id: "",
        accumulated_depreciation_account_id: "",
        depreciation_expense_account_id: "",
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/accounting/assets/categories")
    }

    return (
        <AppLayout
             breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Assets", href: "/accounting/assets" },
                { title: "Categories", href: "/accounting/assets/categories" },
                { title: "Create", href: "/accounting/assets/categories/create" },
            ]}
        >
            <Head title="Create Asset Category" />

            <form onSubmit={submit} className="max-w-3xl mx-auto space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Category</h2>
                        <p className="text-muted-foreground">Define a new asset category setup.</p>
                    </div>
                 </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>Basic information for this asset class.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="e.g. Computers & Equipment"
                                />
                                {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData("code", e.target.value)}
                                    placeholder="e.g. COMP"
                                />
                                {errors.code && <span className="text-sm text-destructive">{errors.code}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="useful_life_years">Useful Life (Years)</Label>
                             <Input
                                id="useful_life_years"
                                type="number"
                                min="1"
                                value={data.useful_life_years}
                                onChange={(e) => setData("useful_life_years", parseInt(e.target.value))}
                            />
                            {errors.useful_life_years && <span className="text-sm text-destructive">{errors.useful_life_years}</span>}
                        </div>
                         
                        <div className="space-y-2">
                             <Label>Depreciation Method</Label>
                             <Select defaultValue="straight_line" disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="straight_line">Straight Line</SelectItem>
                                </SelectContent>
                             </Select>
                             <p className="text-xs text-muted-foreground">Currently only Straight Line is supported.</p>
                        </div>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>GL Accounts</CardTitle>
                        <CardDescription>Default accounts for automatic journal entries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="asset_account_id">Asset Account (Fixed Asset)</Label>
                            <Select
                                value={data.asset_account_id}
                                onValueChange={(val) => setData("asset_account_id", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Asset Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.type === 'ASSET').map((account) => (
                                         <SelectItem key={account.id} value={account.id.toString()}>
                                            {account.code} - {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.asset_account_id && <span className="text-sm text-destructive">{errors.asset_account_id}</span>}
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="accumulated_depreciation_account_id">Accumulated Depreciation Account (Contra Asset)</Label>
                            <Select
                                value={data.accumulated_depreciation_account_id}
                                onValueChange={(val) => setData("accumulated_depreciation_account_id", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Accum. Depr. Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.type === 'ASSET' || a.type === 'LIABILITY').map((account) => ( // Sometimes classified as liability in some systems, usually Contra-Asset
                                         <SelectItem key={account.id} value={account.id.toString()}>
                                            {account.code} - {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.accumulated_depreciation_account_id && <span className="text-sm text-destructive">{errors.accumulated_depreciation_account_id}</span>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="depreciation_expense_account_id">Depreciation Expense Account</Label>
                            <Select
                                value={data.depreciation_expense_account_id}
                                onValueChange={(val) => setData("depreciation_expense_account_id", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Expense Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.type === 'EXPENSE').map((account) => (
                                         <SelectItem key={account.id} value={account.id.toString()}>
                                            {account.code} - {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.depreciation_expense_account_id && <span className="text-sm text-destructive">{errors.depreciation_expense_account_id}</span>}
                        </div>
                    </CardContent>
                 </Card>

                 <div className="flex justify-end space-x-2">
                    <Button variant="outline" asChild>
                        <Link href="/accounting/assets/categories">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        Create Category
                    </Button>
                 </div>
            </form>
        </AppLayout>
    )
}
