import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface Workflow {
    id: number;
    name: string;
    module: string;
    entity_type: string;
    description: string | null;
    is_active: boolean;
    steps: any[];
}

interface Step {
    name: string;
    step_type: string;
    approver_type: string;
    approver_ids: number[];
    approval_type: string;
    sla_hours: number | null;
    [key: string]: any;
}

export default function EditWorkflow({ workflow, roles }: { workflow: Workflow; roles: Role[] }) {
    const [formData, setFormData] = useState({
        name: workflow.name,
        description: workflow.description || '',
        is_active: workflow.is_active,
    });

    const [steps, setSteps] = useState<Step[]>(
        workflow.steps.map((step: any) => ({
            name: step.name,
            step_type: step.step_type,
            approver_type: step.config?.approvers?.type || 'role',
            approver_ids: step.config?.approvers?.role_ids || step.config?.approvers?.user_ids || [],
            approval_type: step.config?.approval_type || 'all',
            sla_hours: step.sla_hours,
        }))
    );

    const addStep = () => {
        setSteps([
            ...steps,
            {
                name: '',
                step_type: 'approval',
                approver_type: 'role',
                approver_ids: [],
                approval_type: 'all',
                sla_hours: 24,
            },
        ]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index: number, field: keyof Step, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/workflows/${workflow.id}`, { ...formData, steps });
    };

    return (
        <AppLayout>
            <Head title="Edit Workflow" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/workflows/management">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Workflow</h1>
                        <p className="text-muted-foreground text-sm">Update workflow configuration</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Update the workflow details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Workflow Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Purchase Order Approval"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Status</Label>
                                    <Select
                                        value={formData.is_active.toString()}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, is_active: value === 'true' })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the purpose of this workflow..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Approval Steps</CardTitle>
                                    <CardDescription>Update the approval stages</CardDescription>
                                </div>
                                <Button type="button" onClick={addStep} variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Step
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {steps.map((step, index) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Step {index + 1}</CardTitle>
                                            {steps.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeStep(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Step Name</Label>
                                                <Input
                                                    value={step.name}
                                                    onChange={(e) => updateStep(index, 'name', e.target.value)}
                                                    placeholder="e.g., Manager Approval"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Approver Type</Label>
                                                <Select
                                                    value={step.approver_type}
                                                    onValueChange={(value) => updateStep(index, 'approver_type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="role">By Role</SelectItem>
                                                        <SelectItem value="user">By User</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Assign To (Role)</Label>
                                                <Select
                                                    value={step.approver_ids[0]?.toString() || ''}
                                                    onValueChange={(value) =>
                                                        updateStep(index, 'approver_ids', [parseInt(value)])
                                                    }
                                                >
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
                                            <div className="space-y-2">
                                                <Label>SLA (Hours)</Label>
                                                <Input
                                                    type="number"
                                                    value={step.sla_hours || ''}
                                                    onChange={(e) =>
                                                        updateStep(index, 'sla_hours', parseInt(e.target.value) || null)
                                                    }
                                                    placeholder="24"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Approval Type</Label>
                                            <Select
                                                value={step.approval_type}
                                                onValueChange={(value) => updateStep(index, 'approval_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All must approve</SelectItem>
                                                    <SelectItem value="any_one">Any one can approve</SelectItem>
                                                    <SelectItem value="majority">Majority must approve</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Link href="/workflows/management">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit">Update Workflow</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
