import AppLayout from "@/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm, Link } from "@inertiajs/react"
import { format } from "date-fns"
import { Plus, Trash, ArrowLeft } from "lucide-react"
import { store, index } from "@/routes/purchasing/blanket-orders"
import { Checkbox } from "@/components/ui/checkbox"

interface Vendor {
  id: number
  name: string
}

interface Agreement {
  id: number
  reference_number: string
  title: string
  vendor_id: number
  start_date: string
  end_date: string | null
}

interface Product {
  id: number
  name: string
  code: string
  price: string
}

interface Props {
  vendors: Vendor[]
  agreements: Agreement[]
  products: Product[]
  initial_values?: {
    vendor_id?: string
    purchase_agreement_id?: string
  }
}

export default function BlanketOrdersCreate({ vendors, agreements, products, initial_values }: Props) {
  const initialAgreement = initial_values?.purchase_agreement_id 
    ? agreements.find(a => a.id.toString() === String(initial_values.purchase_agreement_id))
    : null

  const { data, setData, post, processing, errors } = useForm({
    vendor_id: initial_values?.vendor_id ? String(initial_values.vendor_id) : "",
    purchase_agreement_id: initial_values?.purchase_agreement_id ? String(initial_values.purchase_agreement_id) : "",
    number: "",
    start_date: initialAgreement?.start_date || format(new Date(), "yyyy-MM-dd"),
    end_date: initialAgreement?.end_date || "",
    amount_limit: "",
    status: "draft",
    lines: [] as { product_id: string; unit_price: string; quantity_agreed: string }[],
    renewal_reminder_days: 30,
    is_auto_renew: false,
  })

  // Filter agreements based on selected vendor
  const filteredAgreements = agreements.filter(a => a.vendor_id.toString() === data.vendor_id)

  const addLine = () => {
    setData("lines", [...data.lines, { product_id: "", unit_price: "", quantity_agreed: "" }])
  }

  const removeLine = (index: number) => {
    const newLines = [...data.lines]
    newLines.splice(index, 1)
    setData("lines", newLines)
  }

  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...data.lines]
    // @ts-ignore
    newLines[index][field] = value
    
    // Auto-fill price if product changes
    if (field === 'product_id') {
       const product = products.find(p => p.id.toString() === value)
       if (product) {
           newLines[index].unit_price = product.price
       }
    }

    setData("lines", newLines)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post(store().url)
  }

  const breadcrumbs = [
    { title: "Purchasing", href: "/purchasing" },
    { title: "Blanket Orders", href: "/purchasing/blanket-orders" },
    { title: "Create", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <PageHeader
        title="Create Blanket Order"
        description="Create a new blanket purchase order."
      >
        <Button variant="outline" asChild>
            <Link href={index().url}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Link>
        </Button>
      </PageHeader>

      <div className="">
        <form onSubmit={submit}>
          <Card className="mb-6">
             <CardHeader>
                <CardTitle>General Information</CardTitle>
             </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vendor_id">Vendor <span className="text-red-500">*</span></Label>
                  <Select value={data.vendor_id} onValueChange={(val) => setData("vendor_id", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendor_id && <p className="text-sm text-red-500">{errors.vendor_id}</p>}
                </div>

                <div className="space-y-2">
                   <Label htmlFor="purchase_agreement_id">Agreement (Optional)</Label>
                   <Select 
                     value={data.purchase_agreement_id} 
                     onValueChange={(val) => {
                       const agreement = agreements.find(a => a.id.toString() === val)
                       setData({
                         ...data,
                         purchase_agreement_id: val,
                         start_date: agreement?.start_date || data.start_date,
                         end_date: agreement?.end_date || data.end_date,
                       })
                     }}
                     disabled={!data.vendor_id}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select Agreement" />
                     </SelectTrigger>
                     <SelectContent>
                       {filteredAgreements.map((agreement) => (
                         <SelectItem key={agreement.id} value={agreement.id.toString()}>
                           {agreement.reference_number} - {agreement.title}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {errors.purchase_agreement_id && <p className="text-sm text-red-500">{errors.purchase_agreement_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">BPO Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="number"
                    value={data.number}
                    onChange={(e) => setData("number", e.target.value)}
                    placeholder="e.g. BPO-2025-001"
                  />
                  {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount_limit">Amount Limit <span className="text-red-500">*</span></Label>
                   <Input
                    id="amount_limit"
                    type="number"
                    step="0.01"
                    value={data.amount_limit}
                    onChange={(e) => setData("amount_limit", e.target.value)}
                    placeholder="0.00"
                  />
                  {errors.amount_limit && <p className="text-sm text-red-500">{errors.amount_limit}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData("start_date", e.target.value)}
                  />
                  {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData("end_date", e.target.value)}
                  />
                  {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                   <Select value={data.status} onValueChange={(val) => setData("status", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>

                 <div className="space-y-2">
                   <Label htmlFor="renewal_reminder_days">Renewal Reminder (Days)</Label>
                   <Input 
                    id="renewal_reminder_days" 
                    type="number" 
                    value={data.renewal_reminder_days} 
                    onChange={(e) => setData("renewal_reminder_days", parseInt(e.target.value) || 0)} 
                   />
                   {errors.renewal_reminder_days && <p className="text-sm text-red-500">{errors.renewal_reminder_days}</p>}
                 </div>
                 <div className="flex items-center space-x-2 pt-8">
                   <Checkbox 
                     id="is_auto_renew" 
                     checked={data.is_auto_renew} 
                     onCheckedChange={(checked) => setData("is_auto_renew", !!checked)} 
                   />
                   <Label htmlFor="is_auto_renew">Auto Renew</Label>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Lines (Fixed Pricing)</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                      <Plus className="mr-2 h-4 w-4" /> Add Line
                  </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                  {data.lines.map((line, index) => (
                      <div key={index} className="flex gap-4 items-end border p-4 rounded-lg">
                           <div className="flex-1 space-y-2">
                              <Label>Product</Label>
                              <Select value={line.product_id} onValueChange={(val) => updateLine(index, 'product_id', val)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name} ({product.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="w-32 space-y-2">
                               <Label>Unit Price</Label>
                               <Input 
                                  type="number" 
                                  step="0.01" 
                                  value={line.unit_price} 
                                  onChange={(e) => updateLine(index, 'unit_price', e.target.value)} 
                               />
                           </div>
                           <div className="w-32 space-y-2">
                               <Label>Qty (Opt)</Label>
                               <Input 
                                  type="number" 
                                  step="1" 
                                  value={line.quantity_agreed} 
                                  onChange={(e) => updateLine(index, 'quantity_agreed', e.target.value)} 
                                  placeholder="Unlimited"
                               />
                           </div>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(index)} className="text-red-500">
                               <Trash className="h-4 w-4" />
                           </Button>
                      </div>
                  ))}
                  {data.lines.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">No lines added. Pricing will use standard catalog or manually entered prices on POs.</div>
                  )}
              </CardContent>
          </Card>

           <div className="flex justify-end gap-2 mt-6">
                 <Button variant="outline" asChild>
                    <Link href={index().url}>Cancel</Link>
                 </Button>
                 <Button type="submit" disabled={processing}>
                    Create Blanket Order
                 </Button>
            </div>
        </form>
      </div>
    </AppLayout>
  )
}
