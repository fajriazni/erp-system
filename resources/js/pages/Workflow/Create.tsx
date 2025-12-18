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

interface Step {
    name: string;
    step_type: string;
    approver_type: string;
    approver_ids: number[];
    approval_type: string;
    sla_hours: number | null;
    [key: string]: any;
}

interface WorkflowType {
    id: string;
    label: string;
    children: {
        id: string;
        label: string;
        module: string;
    }[];
}

export default function CreateWorkflow({ roles, workflowTypes }: { roles: Role[], workflowTypes: WorkflowType[] }) {
    const [formData, setFormData] = useState({
        name: '',
        module: '',
        entity_type: '',
        description: '',
    });

    const [steps, setSteps] = useState<Step[]>([
        {
            name: '',
            step_type: 'approval',
            approver_type: 'role',
            approver_ids: [],
            approval_type: 'all',
            sla_hours: 24,
        },
    ]);

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

    const handleEntityChange = (value: string) => {
        let selectedModule = '';
        for (const group of workflowTypes) {
             const found = group.children.find(c => c.id === value);
             if (found) {
                 selectedModule = found.module;
                 break;
             }
        }

        setFormData({ 
            ...formData, 
            entity_type: value,
            module: selectedModule 
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/workflows', { ...formData, steps });
    };

    return (
        <AppLayout>
            <Head title="Create Workflow" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/workflows/management">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Create Workflow</h1>
                        <p className="text-muted-foreground text-sm">Configure a new approval workflow</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Define the workflow details</CardDescription>
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
                                    <Label htmlFor="entity_type">Target Feature</Label>
                                    <Select
                                        value={formData.entity_type}
                                        onValueChange={handleEntityChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a feature..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workflowTypes.map((group) => (
                                                <div key={group.id}>
                                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                                        {group.label}
                                                    </div>
                                                    {group.children.map((child) => (
                                                        <SelectItem key={child.id} value={child.id} className="pl-6">
                                                            {child.label}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Module: {formData.module ? formData.module.charAt(0).toUpperCase() + formData.module.slice(1) : '-'}
                                    </p>
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
                                    <CardDescription>Define the approval stages</CardDescription>
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
                        <Button type="submit">Create Workflow</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
