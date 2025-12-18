import { Head, Link, useForm } from '@inertiajs/react';
import * as Leads from '@/actions/App/Http/Controllers/Sales/Crm/LeadController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';

export default function LeadCreate({ lead_sources, lead_statuses, users }: any) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        status: 'new',
        source: '',
        owner_id: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(Leads.store.url());
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Leads', href: Leads.index.url() }, { title: 'Create', href: '#' }]}>
            <Head title="New Lead" />
            
            <div className="w-full">
                <form onSubmit={handleSubmit}>
                    <PageHeader 
                        title="New Lead" 
                        description="Add a new potential customer to your pipeline."
                        backUrl={Leads.index.url()}
                    >
                        <Button type="submit" disabled={processing}>Save Lead</Button>
                    </PageHeader>
                    <Card>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name <span className="text-red-500">*</span></Label>
                                    <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)} placeholder="Type name..." />
                                    {errors.first_name && <div className="text-red-500 text-sm">{errors.first_name}</div>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} placeholder="Type name..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="example@company.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+1 234 567 890" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input value={data.company_name} onChange={e => setData('company_name', e.target.value)} placeholder="Acme Inc." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Source</Label>
                                    <Input value={data.source} onChange={e => setData('source', e.target.value)} placeholder="Referral, Web, etc." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={data.status} onValueChange={val => setData('status', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="contacted">Contacted</SelectItem>
                                            <SelectItem value="qualified">Qualified</SelectItem>
                                            <SelectItem value="unqualified">Unqualified</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Owner</Label>
                                    <Select value={data.owner_id ? data.owner_id.toString() : ''} onValueChange={val => setData('owner_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Owner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((u: any) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Additional details..." />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="secondary" asChild>
                                    <Link href={Leads.index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>Create Lead</Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
