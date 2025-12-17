import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface EntityType {
    value: string;
    label: string;
}

interface ApprovalRule {
    id: number;
    name: string;
    entity_type: string;
    min_amount: number;
    max_amount: number | null;
    role_id: number | null;
    user_id: number | null;
    level: number;
    is_active: boolean;
}

interface Props {
    rule: ApprovalRule | null;
    roles: Role[];
    users: User[];
    entityTypes: EntityType[];
}

export default function ApprovalRuleForm({ rule, roles, users, entityTypes }: Props) {
    const isEditing = !!rule;
    const [approverType, setApproverType] = useState<'role' | 'user'>(
        rule?.user_id ? 'user' : 'role'
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Record<string, unknown> = {
            name: formData.get('name'),
            entity_type: formData.get('entity_type'),
            min_amount: parseFloat(formData.get('min_amount') as string) || 0,
            max_amount: formData.get('max_amount') ? parseFloat(formData.get('max_amount') as string) : null,
            role_id: approverType === 'role' ? formData.get('role_id') : null,
            user_id: approverType === 'user' ? formData.get('user_id') : null,
            level: parseInt(formData.get('level') as string) || 1,
            is_active: formData.get('is_active') === 'on',
        };

        if (isEditing) {
            router.put(`/admin/approval-rules/${rule.id}`, data as any);
        } else {
            router.post('/admin/approval-rules', data as any);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/admin' },
            { title: 'Approval Rules', href: '/admin/approval-rules' },
            { title: isEditing ? 'Edit Rule' : 'Create Rule' }
        ]}>
            <Head title={isEditing ? 'Edit Approval Rule' : 'Create Approval Rule'} />

            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin/approval-rules">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {isEditing ? 'Edit Approval Rule' : 'Create Approval Rule'}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Rule Configuration</CardTitle>
                                <CardDescription>
                                    Define which documents require approval and by whom.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Rule Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g., Manager Approval > 5M"
                                        defaultValue={rule?.name || ''}
                                        required
                                    />
                                </div>

                                {/* Entity Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="entity_type">Document Type</Label>
                                    <Select name="entity_type" defaultValue={rule?.entity_type || ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select document type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {entityTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Amount Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="min_amount">Minimum Amount</Label>
                                        <Input
                                            id="min_amount"
                                            name="min_amount"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            placeholder="0"
                                            defaultValue={rule?.min_amount || 0}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max_amount">Maximum Amount (optional)</Label>
                                        <Input
                                            id="max_amount"
                                            name="max_amount"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            placeholder="Leave empty for unlimited"
                                            defaultValue={rule?.max_amount || ''}
                                        />
                                    </div>
                                </div>

                                {/* Approver Type */}
                                <div className="space-y-2">
                                    <Label>Approver Type</Label>
                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant={approverType === 'role' ? 'default' : 'outline'}
                                            onClick={() => setApproverType('role')}
                                        >
                                            By Role
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={approverType === 'user' ? 'default' : 'outline'}
                                            onClick={() => setApproverType('user')}
                                        >
                                            Specific User
                                        </Button>
                                    </div>
                                </div>

                                {/* Approver Selection */}
                                {approverType === 'role' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="role_id">Approver Role</Label>
                                        <Select name="role_id" defaultValue={rule?.role_id?.toString() || ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="user_id">Approver User</Label>
                                        <Select name="user_id" defaultValue={rule?.user_id?.toString() || ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Level */}
                                <div className="space-y-2">
                                    <Label htmlFor="level">Approval Level</Label>
                                    <Input
                                        id="level"
                                        name="level"
                                        type="number"
                                        min="1"
                                        max="10"
                                        placeholder="1"
                                        defaultValue={rule?.level || 1}
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Level 1 approves first, Level 2 second, etc.
                                    </p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">Active</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable or disable this approval rule
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        name="is_active"
                                        defaultChecked={rule?.is_active ?? true}
                                    />
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end gap-4 pt-4">
                                    <Link href="/admin/approval-rules">
                                        <Button variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit">
                                        {isEditing ? 'Update Rule' : 'Create Rule'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
