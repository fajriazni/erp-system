import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, FileText, Upload, File } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { store, update, index } from '@/routes/purchasing/vendors';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ContactPerson {
    name: string;
    position: string;
    email: string;
    phone: string;
    is_primary: boolean;
}

interface Document {
    type: string;
    name: string;
    url: string;
}

interface Props {
    vendor?: any;
    paymentTerms?: any[];
}

const VENDOR_CATEGORIES = [
    'Raw Materials', 'Packaging', 'Equipment', 'Services', 'Maintenance',
    'Office Supplies', 'IT & Software', 'Logistics', 'Consultancy', 'Other'
];

const INDUSTRIES = [
    'Manufacturing', 'Trading', 'Services', 'Technology', 'Agriculture',
    'Construction', 'Transportation', 'Food & Beverage', 'Chemicals', 'Other'
];

const DOCUMENT_TYPES = [
    'NPWP (Tax ID)',
    'SIUP (Business License)',
    'TDP (Company Registration)',
    'ISO Certificate',
    'Quality Certificate',
    'Company Profile',
    'Financial Statement',
    'Bank Reference',
    'Other'
];

export default function VendorForm({ vendor, paymentTerms = [] }: Props) {
    const isEditing = !!vendor;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        type: string; name: string; email: string; phone: string; address: string; tax_id: string;
        payment_term_id: string; company_registration_no: string; established_year: string;
        employee_count: string; website: string; notes: string; category: string; industry: string;
        tags: string[]; status: string; bank_name: string; bank_account_number: string;
        bank_account_holder: string; bank_swift_code: string; currency: string;
        contact_persons: ContactPerson[]; documents: Document[];
    }>({
        type: vendor?.type || 'vendor', name: vendor?.name || '', email: vendor?.email || '',
        phone: vendor?.phone || '', address: vendor?.address || '', tax_id: vendor?.tax_id || '',
        payment_term_id: vendor?.payment_term_id ? String(vendor.payment_term_id) : '',
        company_registration_no: vendor?.company_registration_no || '',
        established_year: vendor?.established_year ? String(vendor.established_year) : '',
        employee_count: vendor?.employee_count ? String(vendor.employee_count) : '',
        website: vendor?.website || '', notes: vendor?.notes || '',
        category: vendor?.category || '', industry: vendor?.industry || '',
        tags: vendor?.tags || [], status: vendor?.status || 'active',
        bank_name: vendor?.bank_name || '', bank_account_number: vendor?.bank_account_number || '',
        bank_account_holder: vendor?.bank_account_holder || '',
        bank_swift_code: vendor?.bank_swift_code || '', currency: vendor?.currency || 'IDR',
        contact_persons: vendor?.contact_persons || [], documents: vendor?.documents || [],
    });

    const [newTag, setNewTag] = useState('');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => toast.success(`Vendor ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };
        if (isEditing) {
            put(update.url(vendor.id), options);
        } else {
            post(store.url(), options);
        }
    };

    const addTag = () => {
        if (newTag && !data.tags.includes(newTag)) {
            setData('tags', [...data.tags, newTag]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    const addContactPerson = () => {
        setData('contact_persons', [...data.contact_persons, {
            name: '', position: '', email: '', phone: '', is_primary: data.contact_persons.length === 0
        }]);
    };

    const updateContactPerson = (index: number, field: keyof ContactPerson, value: any) => {
        const updated = [...data.contact_persons];
        updated[index] = { ...updated[index], [field]: value };
        setData('contact_persons', updated);
    };

    const removeContactPerson = (index: number) => {
        setData('contact_persons', data.contact_persons.filter((_, i) => i !== index));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real application, you would upload to server and get back a URL
            // For now, we'll create a mock object URL
            const url = URL.createObjectURL(file);
            const newDoc: Document = {
                type: documentType,
                name: file.name,
                url: url
            };
            setData('documents', [...data.documents, newDoc]);
            toast.success(`${file.name} added successfully`);
        }
    };

    const removeDocument = (index: number) => {
        setData('documents', data.documents.filter((_, i) => i !== index));
        toast.success('Document removed');
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' }, 
            { title: 'Vendors', href: '/purchasing/vendors' },
            { title: isEditing ? 'Edit Vendor' : 'New Vendor', href: '#' }
        ]}>
            <Head title={isEditing ? `Edit ${vendor.name}` : "New Vendor"} />
            
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditing ? `Edit ${vendor.name}` : 'Create New Vendor'}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {isEditing ? 'Update vendor information and settings' : 'Add a new vendor or supplier to your system'}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </div>

                {/* Form Card */}
                <form onSubmit={submit}>
                    <Card>
                        <CardContent className="p-6">
                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                                    <TabsTrigger 
                                        value="basic" 
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Basic Information
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="business" 
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Business Details
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="banking" 
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Banking
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="contacts" 
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Contact Persons
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="documents" 
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Documents
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="payment" 
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Payment Terms
                                    </TabsTrigger>
                                </TabsList>

                                {/* Tab 1: Basic Information */}
                                <TabsContent value="basic" className="space-y-8 mt-6">
                                    {/* Company Information Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Company Information</h3>
                                            <p className="text-sm text-muted-foreground">Basic details about the vendor</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="type">
                                                    Contact Type <span className="text-destructive">*</span>
                                                </Label>
                                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="vendor">Vendor</SelectItem>
                                                        <SelectItem value="customer">Customer</SelectItem>
                                                        <SelectItem value="both">Both</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.type} />
                                            </div>
                                            
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor="name">
                                                    Company Name <span className="text-destructive">*</span>
                                                </Label>
                                                <Input 
                                                    id="name" 
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="PT. Vendor Name"
                                                    className="h-11"
                                                />
                                                <InputError message={errors.name} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="vendor@example.com"
                                                    className="h-11"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input 
                                                    id="phone" 
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="+62 812 3456 7890"
                                                    className="h-11"
                                                />
                                                <InputError message={errors.phone} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="tax_id">Tax ID (NPWP)</Label>
                                                <Input 
                                                    id="tax_id" 
                                                    value={data.tax_id}
                                                    onChange={(e) => setData('tax_id', e.target.value)}
                                                    placeholder="00.000.000.0-000.000"
                                                    className="h-11"
                                                />
                                                <InputError message={errors.tax_id} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="website">Website</Label>
                                                <Input 
                                                    id="website" 
                                                    type="url" 
                                                    value={data.website}
                                                    onChange={(e) => setData('website', e.target.value)}
                                                    placeholder="https://example.com"
                                                    className="h-11"
                                                />
                                                <InputError message={errors.website} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address & Status Section */}
                                    <div className="pt-6 border-t space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Address & Status</h3>
                                            <p className="text-sm text-muted-foreground">Location and account status</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor="address">Full Address</Label>
                                                <Textarea 
                                                    id="address" 
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="Street address, city, province, postal code..."
                                                    rows={4}
                                                    className="resize-none"
                                                />
                                                <InputError message={errors.address} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="status">Account Status</Label>
                                                <Select 
                                                    value={data.status} 
                                                    onValueChange={(val) => setData('status', val)}
                                                    disabled={!isEditing}
                                                >
                                                    <SelectTrigger className="h-11 w-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending_onboarding">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                                Pending Onboarding
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="active">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                                                Active
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="inactive">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                                                Inactive
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="blacklist">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                                Blacklist
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {!isEditing 
                                                        ? 'New vendors start in Pending Onboarding status' 
                                                        : 'Controls vendor\'s ability to receive orders'
                                                    }
                                                </p>
                                                <InputError message={errors.status} />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Tab 2: Business Details */}
                                <TabsContent value="business" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company_registration_no">Company Registration No.</Label>
                                            <Input id="company_registration_no" value={data.company_registration_no}
                                                onChange={(e) => setData('company_registration_no', e.target.value)}
                                                placeholder="NIB / TDP Number" />
                                            <InputError message={errors.company_registration_no} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="established_year">Established Year</Label>
                                            <Input id="established_year" type="number" value={data.established_year}
                                                onChange={(e) => setData('established_year', e.target.value)}
                                                placeholder="2020" min="1800" max={new Date().getFullYear()} />
                                            <InputError message={errors.established_year} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="employee_count">Number of Employees</Label>
                                            <Input id="employee_count" type="number" value={data.employee_count}
                                                onChange={(e) => setData('employee_count', e.target.value)}
                                                placeholder="50" min="1" />
                                            <InputError message={errors.employee_count} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                                <SelectContent>
                                                    {VENDOR_CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.category} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Industry</Label>
                                        <Select value={data.industry} onValueChange={(val) => setData('industry', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                                            <SelectContent>
                                                {INDUSTRIES.map((ind) => (
                                                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.industry} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tags</Label>
                                        <div className="flex gap-2">
                                            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)}
                                                placeholder="Add tag..."
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                            <Button type="button" onClick={addTag} variant="outline">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {data.tags.map((tag, idx) => (
                                                <div key={idx} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea id="notes" value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Additional notes about this vendor..." rows={4} />
                                        <InputError message={errors.notes} />
                                    </div>
                                </TabsContent>

                                {/* Tab 3: Banking Information */}
                                <TabsContent value="banking" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_name">Bank Name</Label>
                                            <Input id="bank_name" value={data.bank_name}
                                                onChange={(e) => setData('bank_name', e.target.value)}
                                                placeholder="e.g., Bank Mandiri" />
                                            <InputError message={errors.bank_name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bank_account_number">Account Number</Label>
                                            <Input id="bank_account_number" value={data.bank_account_number}
                                                onChange={(e) => setData('bank_account_number', e.target.value)}
                                                placeholder="1234567890" />
                                            <InputError message={errors.bank_account_number} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_account_holder">Account Holder Name</Label>
                                            <Input id="bank_account_holder" value={data.bank_account_holder}
                                                onChange={(e) => setData('bank_account_holder', e.target.value)}
                                                placeholder="PT. Vendor Name" />
                                            <InputError message={errors.bank_account_holder} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select value={data.currency} onValueChange={(val) => setData('currency', val)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                                                    <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.currency} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bank_swift_code">SWIFT/BIC Code (for international transfers)</Label>
                                        <Input id="bank_swift_code" value={data.bank_swift_code}
                                            onChange={(e) => setData('bank_swift_code', e.target.value)}
                                            placeholder="BMRIIDJA" />
                                        <InputError message={errors.bank_swift_code} />
                                    </div>
                                </TabsContent>

                                {/* Tab 4: Contact Persons */}
                                <TabsContent value="contacts" className="space-y-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Contact Persons</Label>
                                        <Button type="button" onClick={addContactPerson} size="sm">
                                            <Plus className="h-4 w-4 mr-2" /> Add Contact
                                        </Button>
                                    </div>

                                    {data.contact_persons.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                            No contact persons added yet. Click "Add Contact" to get started.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.contact_persons.map((contact, index) => (
                                                <Card key={index}>
                                                    <CardContent className="pt-6">
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="font-semibold">Contact {index + 1}</h4>
                                                                <Button
                                                                    type="button" variant="ghost" size="sm"
                                                                    onClick={() => removeContactPerson(index)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Name</Label>
                                                                    <Input value={contact.name}
                                                                        onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                                                                        placeholder="John Doe" />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label>Position</Label>
                                                                    <Input value={contact.position}
                                                                        onChange={(e) => updateContactPerson(index, 'position', e.target.value)}
                                                                        placeholder="Sales Manager" />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Email</Label>
                                                                    <Input type="email" value={contact.email}
                                                                        onChange={(e) => updateContactPerson(index, 'email', e.target.value)}
                                                                        placeholder="john@vendor.com" />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label>Phone</Label>
                                                                    <Input value={contact.phone}
                                                                        onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                                                                        placeholder="+62 812 3456 7890" />
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <input type="checkbox" id={`primary-${index}`}
                                                                    checked={contact.is_primary}
                                                                    onChange={(e) => updateContactPerson(index, 'is_primary', e.target.checked)}
                                                                    className="rounded" />
                                                                <Label htmlFor={`primary-${index}`} className="cursor-pointer">
                                                                    Primary Contact
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Tab 5: Documents */}
                                <TabsContent value="documents" className="space-y-6 mt-6">
                                    {/* Document Upload Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Upload Documents</h3>
                                            <p className="text-sm text-muted-foreground">Add required business documents</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {DOCUMENT_TYPES.map((docType) => (
                                                <div key={docType} className="relative">
                                                    <input
                                                        type="file"
                                                        id={`upload-${docType}`}
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, docType)}
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    />
                                                    <label
                                                        htmlFor={`upload-${docType}`}
                                                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-accent transition-colors h-28"
                                                    >
                                                        <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-center">{docType}</span>
                                                        <span className="text-xs text-muted-foreground mt-1">Click to upload</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {data.documents.length > 0 && (
                                        <div className="pt-6 border-t space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {data.documents.length} document{data.documents.length !== 1 ? 's' : ''} uploaded
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {data.documents.map((doc, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="p-2 bg-primary/10 rounded">
                                                                <FileText className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium truncate">{doc.name}</p>
                                                                <p className="text-sm text-muted-foreground">{doc.type}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => window.open(doc.url, '_blank')}
                                                            >
                                                                <File className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeDocument(index)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {data.documents.length === 0 && (
                                        <div className="pt-6 border-t">
                                            <div className="text-center py-8 text-muted-foreground">
                                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p className="font-medium">No documents uploaded yet</p>
                                                <p className="text-sm mt-1">Click on any document type above to upload</p>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Tab 6: Payment Terms */}
                                <TabsContent value="payment" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_term_id">Default Payment Term</Label>
                                        <Select value={data.payment_term_id}
                                            onValueChange={(val) => setData('payment_term_id', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select payment term" /></SelectTrigger>
                                            <SelectContent>
                                                {paymentTerms?.map((term) => (
                                                    <SelectItem key={term.id} value={String(term.id)}>
                                                        {term.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            This will be the default payment term for new Purchase Orders with this vendor.
                                        </p>
                                        <InputError message={errors.payment_term_id} />
                                    </div>

                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                        <h4 className="font-semibold text-sm">Payment Information</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Additional payment terms and pricing agreements can be configured in the Contracts module.
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : (isEditing ? 'Update Vendor' : 'Create Vendor')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
