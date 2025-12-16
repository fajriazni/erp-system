import { useState, ChangeEvent, FormEvent } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { update } from '@/routes/company';

interface Company {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    logo_path: string | null;
    currency: string;
    tax_id: string | null;
}

interface Props {
    company: Company;
    status?: string;
}

export default function CompanySettings({ company, status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        currency: company.currency || 'IDR',
        tax_id: company.tax_id || '',
        logo: null as File | null,
        _method: 'PATCH',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        company.logo_path ? `/storage/${company.logo_path}` : null
    );

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Company profile updated successfully.');
            },
            onError: () => {
                toast.error('Failed to update company profile. Please check the form.');
            }
        });
    };

    return (
        <SettingsLayout>
             <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Company Profile
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Update your company's information and branding.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6 max-w-xl">
                    {/* Logo */}
                    <div>
                         <Label htmlFor="logo">Company Logo</Label>
                         <div className="mt-2 flex items-center gap-x-3">
                             {logoPreview ? (
                                 <img
                                     src={logoPreview}
                                     alt="Company Logo"
                                     className="h-16 w-16 rounded-full object-cover"
                                 />
                             ) : (
                                 <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                     Logo
                                 </div>
                             )}
                             <input
                                 type="file"
                                 id="logo"
                                 className="hidden"
                                 onChange={handleLogoChange}
                                 accept="image/*"
                             />
                             <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 onClick={() => document.getElementById('logo')?.click()}
                             >
                                 Change Logo
                             </Button>
                         </div>
                         <InputError className="mt-2" message={errors.logo} />
                    </div>

                    {/* Name */}
                     <div>
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                            required
                            autoComplete="organization"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                            autoComplete="email"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                     {/* Phone */}
                     <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            className="mt-1 block w-full"
                            value={data.phone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)}
                            autoComplete="tel"
                        />
                        <InputError className="mt-2" message={errors.phone} />
                    </div>

                    {/* Address */}
                    <div>
                        <Label htmlFor="address">Address</Label>
                         <textarea
                            id="address"
                            className="mt-1 block w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            value={data.address}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)}
                            rows={3}
                        />
                        <InputError className="mt-2" message={errors.address} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Currency */}
                        <div>
                            <Label htmlFor="currency">Currency (ISO)</Label>
                            <Input
                                id="currency"
                                className="mt-1 block w-full"
                                value={data.currency}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('currency', e.target.value)}
                                maxLength={3}
                            />
                            <InputError className="mt-2" message={errors.currency} />
                        </div>

                        {/* Tax ID */}
                         <div>
                            <Label htmlFor="tax_id">Tax ID (NPWP)</Label>
                            <Input
                                id="tax_id"
                                className="mt-1 block w-full"
                                value={data.tax_id}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('tax_id', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.tax_id} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save</Button>
                    </div>
                </form>
             </div>
        </SettingsLayout>
    );
}

CompanySettings.layout = (page: any) => <AppLayout children={page} breadcrumbs={[
    { title: 'Settings', href: '/settings/company' },
    { title: 'Company Profile', href: '#' }
]} />;
