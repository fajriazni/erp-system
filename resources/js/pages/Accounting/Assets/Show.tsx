import AppLayout from "@/layouts/app-layout"
import { Head, Link, useForm, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, PlayCircle } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AssetShow({ asset }: { asset: any }) {
    const { data, setData, post, processing } = useForm({
        date: format(new Date(), 'yyyy-MM-dd')
    })
    const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)

    const handleRunDepreciation = (e: React.FormEvent) => {
        e.preventDefault()
        post('/accounting/assets/run-depreciation', {
            onSuccess: () => setIsRunDialogOpen(false)
        })
    }

    return (
        <AppLayout
             breadcrumbs={[
                { title: "Accounting", href: "/accounting" },
                { title: "Assets", href: "/accounting/assets" },
                { title: asset.asset_number, href: `/accounting/assets/${asset.id}` },
            ]}
        >
            <Head title={`Asset ${asset.asset_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                             <Button variant="ghost" size="sm" asChild className="-ml-2">
                                <Link href="/accounting/assets">
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Back
                                </Link>
                            </Button>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mt-1">{asset.name}</h2>
                        <div className="flex items-center space-x-2 text-muted-foreground mt-1">
                             <span>{asset.asset_number}</span>
                             <span>•</span>
                             <span>{asset.category.name}</span>
                             <span>•</span>
                             <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                                {asset.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                    
                    <div className="flex space-x-2">
                        <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
                            <DialogTrigger asChild>
                                 <Button>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Run Depreciation
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Run Depreciation</DialogTitle>
                                    <DialogDescription>
                                        Run depreciation for all eligible active assets up to the selected date.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRunDepreciation} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Depreciation Date</Label>
                                        <Input 
                                            type="date" 
                                            value={data.date} 
                                            onChange={(e) => setData("date", e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" type="button" onClick={() => setIsRunDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={processing}>Run</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                             <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Original Cost</p>
                                    <p className="text-2xl font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.cost)}
                                    </p>
                                </div>
                                 <div>
                                    <p className="text-sm font-medium text-muted-foreground">Current Book Value</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.book_value)}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Salvage Value</p>
                                    <p className="font-medium">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.salvage_value)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Useful Life</p>
                                    <p className="font-medium">{asset.category.useful_life_years} Years</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                                    <p className="font-medium">{format(new Date(asset.purchase_date), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Start Depreciation</p>
                                    <p className="font-medium">{format(new Date(asset.start_depreciation_date), 'PPP')}</p>
                                </div>

                                {asset.serial_number && (
                                     <div>
                                        <p className="text-sm text-muted-foreground">Serial Number</p>
                                        <p className="font-medium">{asset.serial_number}</p>
                                    </div>
                                )}
                                {asset.location && (
                                     <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{asset.location}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Asset Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-muted-foreground">Accumulated Depr.</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.cost - asset.book_value)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-muted-foreground">Remaining Value</span>
                                <span className="font-medium">
                                     {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.book_value)}
                                </span>
                            </div>
                             <div className="flex justify-between items-center pb-2">
                                <span className="text-sm text-muted-foreground">Depreciation Method</span>
                                <span className="font-medium capitalize">
                                     {asset.category.depreciation_method.replace('_', ' ')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Depreciation History</CardTitle>
                        <CardDescription>Record of depreciation entries posted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Journal Entry</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Book Value After</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {asset.depreciation_entries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                            No depreciation entries yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    asset.depreciation_entries.map((entry: any) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{format(new Date(entry.date), 'PP')}</TableCell>
                                            <TableCell>Monthly Depreciation</TableCell>
                                            <TableCell>
                                                <Link href={`/accounting/journal-entries/${entry.gl_entry_id}`} className="text-primary hover:underline">
                                                    {entry.journal_entry?.reference_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.amount)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.book_value_after)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
