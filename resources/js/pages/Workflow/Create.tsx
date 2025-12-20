import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/ui/page-header';
import { Plus, Trash2, ArrowLeft, MoveUp, MoveDown } from 'lucide-react';
import { useState } from 'react';
import { Workflow, WorkflowStep, WorkflowType, Role, User, FieldOption } from '@/types/workflow';
import ConditionBuilder from '@/components/workflow/ConditionBuilder';
import WorkflowPreview from '@/components/workflow/WorkflowPreview';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function CreateWorkflow({ 
    roles, 
    users, 
    workflowTypes 
}: { 
    roles: Role[]; 
    users: User[];
    workflowTypes: WorkflowType[];
}) {
    const [formData, setFormData] = useState<Partial<Workflow>>({
        name: '',
        module: '',
        entity_type: '',
        description: '',
        is_active: true,
        steps: [],
    });

    const [steps, setSteps] = useState<WorkflowStep[]>([
        {
            name: '',
            step_type: 'approval',
            approver_type: 'role',
            approver_ids: [],
            approval_type: 'all',
            sla_hours: 24,
            conditions: [],
        },
    ]);

    const [availableFields, setAvailableFields] = useState<FieldOption[]>([]);

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
                conditions: [],
            },
        ]);
    };

    const removeStep = (index: number) => {
        if (steps.length === 1) {
            toast.error('Workflow must have at least one step');
            return;
        }
        setSteps(steps.filter((_, i) => i !== index));
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= steps.length) return;
        
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    };

    const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const changeApproverType = (index: number, type: 'role' | 'user') => {
        const newSteps = [...steps];
        newSteps[index] = { 
            ...newSteps[index], 
            approver_type: type,
            approver_ids: [] 
        };
        setSteps(newSteps);
    };

    const toggleApprover = (stepIndex: number, approverId: number) => {
        const step = steps[stepIndex];
        const currentIds = step.approver_ids || [];
        
        const newIds = currentIds.includes(approverId)
            ? currentIds.filter(id => id !== approverId)
            : [...currentIds, approverId];
        
        updateStep(stepIndex, 'approver_ids', newIds);
    };

    const getEntityFields = (entityType: string): FieldOption[] => {
        // Find the entity in workflowTypes
        for (const group of workflowTypes) {
            const entity = group.children.find(c => c.id === entityType);
            if (entity && entity.fields) {
                return entity.fields;
            }
        }
        
        // Default fields for common entities
        if (entityType.includes('PurchaseOrder')) {
            return [
                { value: 'total', label: 'Total Amount', type: 'number' },
                { value: 'subtotal', label: 'Subtotal', type: 'number' },
                { value: 'tax_amount', label: 'Tax Amount', type: 'number' },
                { value: 'vendor.id', label: 'Vendor ID', type: 'number' },
                { value: 'warehouse.id', label: 'Warehouse ID', type: 'number' },
                { value: 'status', label: 'Status', type: 'string' },
                { value: 'date', label: 'Date', type: 'date' },
            ];
        }
        
        if (entityType.includes('PurchaseRequest')) {
            return [
                { value: 'estimated_total', label: 'Estimated Total', type: 'number' },
                { value: 'requester.id', label: 'Requester ID', type: 'number' },
                { value: 'department.id', label: 'Department ID', type: 'number' },
                { value: 'priority', label: 'Priority', type: 'string' },
                { value: 'status', label: 'Status', type: 'string' },
            ];
        }
        
        return [];
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

        // Update available fields
        setAvailableFields(getEntityFields(value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.entity_type) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (steps.length === 0) {
            toast.error('Workflow must have at least one step');
            return;
        }

        // Check each step has approvers
        for (let i = 0; i < steps.length; i++) {
            if (steps[i].approver_ids.length === 0) {
                toast.error(`Step ${i + 1} must have at least one approver`);
                return;
            }
        }

        router.post('/workflows', {
            ...formData,
            steps: steps.map((step, index) => ({
                ...step,
                step_number: index + 1,
                // Serialize conditions properly for form submission
                conditions: step.conditions.map(condition => ({
                    ...condition,
                    value: condition.value.map(v => String(v)),
                })),
                // Ensure config is properly structured
                config: {
                    approver_type: step.approver_type,
                    approver_ids: step.approver_ids,
                    approval_type: step.approval_type,
                },
            })),
        }, {
            onSuccess: () => toast.success('Workflow created successfully'),
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to create workflow');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Workflows', href: '/workflows/management' },
            { title: 'Create', href: '#' }
        ]}>
            <Head title="Create Workflow" />

            <div className="space-y-6">
                <PageHeader
                    title="Create Workflow"
                    description="Configure a new conditional approval workflow"
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/workflows/management">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </PageHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Define the workflow details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Workflow Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Purchase Order Approval"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="entity_type">
                                                Target Feature <span className="text-destructive">*</span>
                                            </Label>
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
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active (workflow can be used immediately)
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Approval Steps */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Approval Steps</CardTitle>
                                            <CardDescription>
                                                Define the approval stages with optional conditions
                                            </CardDescription>
                                        </div>
                                        <Button type="button" onClick={addStep} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Step
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" defaultValue={['step-0']} className="space-y-4">
                                        {steps.map((step, index) => (
                                            <AccordionItem key={index} value={`step-${index}`} className="border rounded-lg">
                                                <div className="flex items-center">
                                                    <AccordionTrigger className="px-4 hover:no-underline flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">Step {index + 1}</span>
                                                            {step.name && (
                                                                <span className="text-muted-foreground">- {step.name}</span>
                                                            )}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <div className="flex items-center gap-2 px-4">
                                                        {index > 0 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveStep(index, 'up');
                                                                }}
                                                            >
                                                                <MoveUp className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {index < steps.length - 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveStep(index, 'down');
                                                                }}
                                                            >
                                                                <MoveDown className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {steps.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeStep(index);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <AccordionContent className="px-4 pb-4">
                                                    <div className="space-y-4 pt-4">
                                                        {/* Step Configuration */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Step Name <span className="text-destructive">*</span></Label>
                                                                <Input
                                                                    value={step.name}
                                                                    onChange={(e) => updateStep(index, 'name', e.target.value)}
                                                                    placeholder="e.g., Manager Approval"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Step Type</Label>
                                                                <Select
                                                                    value={step.step_type}
                                                                    onValueChange={(value) => updateStep(index, 'step_type', value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="approval">Approval</SelectItem>
                                                                        <SelectItem value="notification">Notification</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Approvers */}
                                                        <div className="space-y-3">
                                                            <Label>Assign To <span className="text-destructive">*</span></Label>
                                                            
                                                            <div className="flex gap-4 mb-2">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={`approver-type-${index}`}
                                                                        value="role"
                                                                        checked={step.approver_type === 'role'}
                                                                        onChange={() => changeApproverType(index, 'role')}
                                                                        className="text-primary"
                                                                    />
                                                                    <span className="text-sm">By Role</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={`approver-type-${index}`}
                                                                        value="user"
                                                                        checked={step.approver_type === 'user'}
                                                                        onChange={() => changeApproverType(index, 'user')}
                                                                        className="text-primary"
                                                                    />
                                                                    <span className="text-sm">By User</span>
                                                                </label>
                                                            </div>

                                                            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                                                                {step.approver_type === 'role' ? (
                                                                    roles.map((role) => (
                                                                        <div key={role.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`role-${index}-${role.id}`}
                                                                                checked={step.approver_ids.includes(role.id)}
                                                                                onCheckedChange={() => toggleApprover(index, role.id)}
                                                                            />
                                                                            <label
                                                                                htmlFor={`role-${index}-${role.id}`}
                                                                                className="text-sm cursor-pointer flex-1"
                                                                            >
                                                                                {role.name}
                                                                            </label>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    users.map((user) => (
                                                                        <div key={user.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`user-${index}-${user.id}`}
                                                                                checked={step.approver_ids.includes(user.id)}
                                                                                onCheckedChange={() => toggleApprover(index, user.id)}
                                                                            />
                                                                            <label
                                                                                htmlFor={`user-${index}-${user.id}`}
                                                                                className="text-sm cursor-pointer flex-1"
                                                                            >
                                                                                {user.name} ({user.email})
                                                                            </label>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Approval Settings */}
                                                        <div className="grid grid-cols-2 gap-4">
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

                                                        {/* Conditions */}
                                                        {availableFields.length > 0 && (
                                                            <div className="space-y-2">
                                                                <ConditionBuilder
                                                                    conditions={step.conditions}
                                                                    onChange={(conditions) => updateStep(index, 'conditions', conditions)}
                                                                    availableFields={availableFields}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-2">
                                <Link href="/workflows/management">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit">Create Workflow</Button>
                            </div>
                        </div>

                        {/* Preview Sidebar */}
                        <div className="lg:col-span-1">
                            <WorkflowPreview workflow={{ ...formData, steps }} />
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
