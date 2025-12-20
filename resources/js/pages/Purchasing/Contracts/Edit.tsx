import AppLayout from "@/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm, Link } from "@inertiajs/react"
import { update, index } from "@/routes/purchasing/contracts"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

interface Vendor {
  id: number
  name: string
}

interface Agreement {
  id: number
  vendor_id: number
  reference_number: string
  title: string
  start_date: string
  end_date: string | null
  status: string
  total_value_cap: string | null
  document_path: string | null
  renewal_reminder_days: number
  is_auto_renew: boolean
}

interface Props {
  agreement: Agreement
  vendors: Vendor[]
}

export default function ContractsEdit({ agreement, vendors }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    vendor_id: agreement.vendor_id.toString(),
    reference_number: agreement.reference_number,
    title: agreement.title,
    start_date: agreement.start_date ? format(new Date(agreement.start_date), "yyyy-MM-dd") : "",
    end_date: agreement.end_date ? format(new Date(agreement.end_date), "yyyy-MM-dd") : "",
    status: agreement.status,
    total_value_cap: agreement.total_value_cap || "",
    document: null as File | null,
    renewal_reminder_days: agreement.renewal_reminder_days || 30,
    is_auto_renew: !!agreement.is_auto_renew,
  })

  // Using post with _method: PUT for file upload support in Laravel
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Using post method for update because of file upload (method spoofing)
    post(update(agreement.id).url) 
  }

  const breadcrumbs = [
    { title: "Purchasing", href: "/purchasing" },
    { title: "Contracts", href: "/purchasing/contracts" },
    { title: "Edit", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <PageHeader
        title={`Edit Agreement: ${agreement.reference_number}`}
        description="Update contract details."
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
          <Card>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reference_number">Reference Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="reference_number"
                    value={data.reference_number}
                    onChange={(e) => setData("reference_number", e.target.value)}
                    placeholder="e.g. CTR-2025-001"
                  />
                  {errors.reference_number && <p className="text-sm text-red-500">{errors.reference_number}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                   <Select value={data.status} onValueChange={(val) => setData("status", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData("title", e.target.value)}
                  placeholder="Agreement Title"
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

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

              <div className="grid grid-cols-2 gap-6">
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
              </div>

              <div className="space-y-2">
                 <Label htmlFor="total_value_cap">Total Value Cap</Label>
                 <Input
                  id="total_value_cap"
                  type="number"
                  step="0.01"
                  value={data.total_value_cap}
                  onChange={(e) => setData("total_value_cap", e.target.value)}
                  placeholder="0.00"
                />
                 {errors.total_value_cap && <p className="text-sm text-red-500">{errors.total_value_cap}</p>}
              </div>

               <div className="grid grid-cols-2 gap-6">
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

               <div className="space-y-2">
                 <Label htmlFor="document">Contract Document (PDF)</Label>
                 {agreement.document_path && (
                    <div className="text-sm text-muted-foreground mb-1">
                        Current file: {agreement.document_path.split('/').pop()}
                    </div>
                 )}
                 <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => setData("document", e.target.files ? e.target.files[0] : null)}
                />
                 {errors.document && <p className="text-sm text-red-500">{errors.document}</p>}
              </div>

              <div className="flex justify-end gap-2">
                 <Button variant="outline" asChild>
                    <Link href={index().url}>Cancel</Link>
                 </Button>
                 <Button type="submit" disabled={processing}>
                    Save Changes
                 </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  )
}
