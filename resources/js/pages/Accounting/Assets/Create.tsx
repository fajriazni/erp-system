import AppLayout from "@/layouts/app-layout"
import { Head, useForm, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

export default function AssetsCreate({ categories }: { categories: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        asset_number: "",
        category_id: "",
        purchase_date: format(new Date(), "yyyy-MM-dd"),
        start_depreciation_date: format(new Date(), "yyyy-MM-dd"),
        cost: "",
        salvage_value: "0",
        serial_number: "",
        location: "",
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/accounting/assets")
    }

    return (
        <AppLayout
             breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Assets", href: "/accounting/assets" },
                { title: "Create", href: "/accounting/assets/create" },
            ]}
        >
            <Head title="Register Asset" />

            <form onSubmit={submit} className="w-full space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Register New Asset</h2>
                        <p className="text-muted-foreground">Enter details for the new fixed asset.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Asset Details</CardTitle>
                            <CardDescription>Identification and classification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Asset Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="e.g. 2024 MacBook pro"
                                />
                                {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="asset_number">Asset Tag / Number</Label>
                                <Input
                                    id="asset_number"
                                    value={data.asset_number}
                                    onChange={(e) => setData("asset_number", e.target.value)}
                                    placeholder="e.g. FA-001"
                                />
                                {errors.asset_number && <span className="text-sm text-destructive">{errors.asset_number}</span>}
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(val) => setData("category_id", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                             <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.code} - {category.name} ({category.useful_life_years} yrs)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && <span className="text-sm text-destructive">{errors.category_id}</span>}
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="serial_number">Serial Number</Label>
                                    <Input
                                        id="serial_number"
                                        value={data.serial_number}
                                        onChange={(e) => setData("serial_number", e.target.value)}
                                    />
                                    {errors.serial_number && <span className="text-sm text-destructive">{errors.serial_number}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData("location", e.target.value)}
                                    />
                                    {errors.location && <span className="text-sm text-destructive">{errors.location}</span>}
                                </div>
                             </div>
                        </CardContent>
                     </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Financials</CardTitle>
                            <CardDescription>Cost and depreciation settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase_date">Purchase Date</Label>
                                    <Input
                                        id="purchase_date"
                                        type="date"
                                        value={data.purchase_date}
                                        onChange={(e) => setData("purchase_date", e.target.value)}
                                    />
                                    {errors.purchase_date && <span className="text-sm text-destructive">{errors.purchase_date}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start_depreciation_date">Start Depr. Date</Label>
                                    <Input
                                        id="start_depreciation_date"
                                        type="date"
                                        value={data.start_depreciation_date}
                                        onChange={(e) => setData("start_depreciation_date", e.target.value)}
                                    />
                                    {errors.start_depreciation_date && <span className="text-sm text-destructive">{errors.start_depreciation_date}</span>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="cost">Acquisition Cost</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.cost}
                                    onChange={(e) => setData("cost", e.target.value)}
                                />
                                {errors.cost && <span className="text-sm text-destructive">{errors.cost}</span>}
                            </div>
                             
                            <div className="space-y-2">
                                <Label htmlFor="salvage_value">Salvage Value</Label>
                                <Input
                                    id="salvage_value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.salvage_value}
                                    onChange={(e) => setData("salvage_value", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Estimated value at end of useful life.</p>
                                {errors.salvage_value && <span className="text-sm text-destructive">{errors.salvage_value}</span>}
                            </div>
                        </CardContent>
                     </Card>
                 </div>

                 <div className="flex justify-end space-x-2">
                    <Button variant="outline" asChild>
                        <Link href="/accounting/assets">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        Register Asset
                    </Button>
                 </div>
            </form>
        </AppLayout>
    )
}
