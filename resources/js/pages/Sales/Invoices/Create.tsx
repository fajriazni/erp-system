import AppLayout from "@/layouts/app-layout"
import { Head, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
// import { DatePicker } from "@/components/ui/date-picker" // Assuming exists, otherwise use Input type=date

export default function CreateInvoice({ customers, products }: { customers: any[], products: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`, // Simple auto-gen
        reference_number: '',
        tax_rate: 0,
        tax_inclusive: false,
        notes: '',
        items: [
            { product_id: '', description: '', quantity: 1, unit_price: 0 }
        ]
    })

    const addItem = () => {
        setData('items', [
            ...data.items,
            { product_id: '', description: '', quantity: 1, unit_price: 0 }
        ])
    }

    const removeItem = (index: number) => {
        const newItems = [...data.items]
        newItems.splice(index, 1)
        setData('items', newItems)
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items]
        newItems[index] = { ...newItems[index], [field]: value }
        
        // Auto-fill description/price if product selected
        if (field === 'product_id') {
            const product = products.find(p => p.id == value)
            if (product) {
                newItems[index].description = product.name
                newItems[index].unit_price = product.price || 0
            }
        }
        
        setData('items', newItems)
    }

    const calculateSubtotal = () => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }

    const calculateTotal = () => {
        const subtotal = calculateSubtotal()
        const taxAmount = (subtotal * data.tax_rate) / 100
        return subtotal + taxAmount; 
        // Note: Logic simplified here, Controller uses Domain Service for strict calculation
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/sales/invoices')
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Invoices", href: "/sales/invoices" }, { title: "Create", href: "#" }]}>
            <Head title="Create Invoice" />

            <form onSubmit={submit} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">New Invoice</h2>
                        <p className="text-muted-foreground">Create a new customer invoice.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Save Invoice</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Select onValueChange={(val) => setData('customer_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Invoice Date</Label>
                                    <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Invoice Number</Label>
                                <Input value={data.invoice_number} onChange={e => setData('invoice_number', e.target.value)} />
                                {errors.invoice_number && <p className="text-sm text-red-500">{errors.invoice_number}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label>Reference</Label>
                                <Input value={data.reference_number} onChange={e => setData('reference_number', e.target.value)} placeholder="PO # etc." />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium">Items</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="grid gap-4 items-end sm:grid-cols-12 border-b pb-4 last:border-0 last:pb-0">
                                    <div className="sm:col-span-4 space-y-2">
                                        <Label>Product</Label>
                                        <Select value={String(item.product_id)} onValueChange={(val) => updateItem(index, 'product_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="sm:col-span-3 space-y-2">
                                        <Label>Description</Label>
                                        <Input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <Label>Qty</Label>
                                        <Input type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <Label>Price</Label>
                                        <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="sm:col-span-1">
                                         <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={data.items.length === 1}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Card className="w-full md:w-1/3">
                        <CardContent className="pt-6 space-y-2">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Tax Rate %</span>
                                <Input className="w-20 h-8 text-right" type="number" value={data.tax_rate} onChange={e => setData('tax_rate', parseFloat(e.target.value))} />
                            </div>
                             <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>{calculateTotal().toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    )
}
