import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface Props {
    parents: any[];
    types: string[];
}

export default function Create({ parents, types }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        type: '',
        parent_id: '',
        description: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/accounting/coa');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Chart of Accounts', href: '/accounting/coa' },
                { title: 'Create', href: '#' },
            ]}
        >
            <Head title="Create Account" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="-ml-4">
                        <Link href="/accounting/coa">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight mt-2">New Account</h1>
                    <p className="text-muted-foreground">Add a new account to your chart of accounts.</p>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Account Code</Label>
                                    <Input 
                                        id="code" 
                                        value={data.code} 
                                        onChange={e => setData('code', e.target.value)}
                                        placeholder="e.g. 1100"
                                        required
                                    />
                                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Account Type</Label>
                                    <Select value={data.type} onValueChange={val => setData('type', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map(t => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Account Name</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Cash on Hand"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_id">Parent Account (Optional)</Label>
                                <Select value={data.parent_id} onValueChange={val => setData('parent_id', val === 'none' ? '' : val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Parent (Top Level)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- No Parent --</SelectItem>
                                        {parents.map(p => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.code} - {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.parent_id && <p className="text-sm text-red-500">{errors.parent_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Optional description..."
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="is_active" 
                                    checked={data.is_active} 
                                    onCheckedChange={(checked) => setData('is_active', !!checked)} 
                                />
                                <Label htmlFor="is_active">Active Account</Label>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-6 bg-muted/50">
                             <Button variant="outline" asChild>
                                <Link href="/accounting/coa">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Account'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
