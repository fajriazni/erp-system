import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Info } from 'lucide-react';
import { WorkflowCondition, FieldOption } from '@/types/workflow';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConditionBuilderProps {
    conditions: WorkflowCondition[];
    onChange: (conditions: WorkflowCondition[]) => void;
    availableFields: FieldOption[];
}

export default function ConditionBuilder({ conditions, onChange, availableFields }: ConditionBuilderProps) {
    const addCondition = (groupNumber: number = 1) => {
        const newCondition: WorkflowCondition = {
            field_path: availableFields[0]?.value || '',
            operator: '>=',
            value: [''],
            logical_operator: 'and',
            group_number: groupNumber,
        };
        onChange([...conditions, newCondition]);
    };

    const removeCondition = (index: number) => {
        onChange(conditions.filter((_, i) => i !== index));
    };

    const updateCondition = (index: number, field: keyof WorkflowCondition, value: any) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        onChange(newConditions);
    };

    const getFieldType = (fieldPath: string): string => {
        const field = availableFields.find(f => f.value === fieldPath);
        return field?.type || 'string';
    };

    const getOperatorOptions = (fieldPath: string) => {
        const type = getFieldType(fieldPath);
        
        switch (type) {
            case 'number':
                return [
                    { value: '=', label: 'Equals (=)' },
                    { value: '!=', label: 'Not equals (≠)' },
                    { value: '>', label: 'Greater than (>)' },
                    { value: '<', label: 'Less than (<)' },
                    { value: '>=', label: 'Greater or equal (≥)' },
                    { value: '<=', label: 'Less or equal (≤)' },
                    { value: 'between', label: 'Between' },
                ];
            case 'string':
                return [
                    { value: '=', label: 'Equals' },
                    { value: '!=', label: 'Not equals' },
                    { value: 'contains', label: 'Contains' },
                ];
            case 'array':
                return [
                    { value: 'in', label: 'In' },
                    { value: 'not_in', label: 'Not in' },
                ];
            default:
                return [
                    { value: '=', label: 'Equals' },
                    { value: '!=', label: 'Not equals' },
                ];
        }
    };

    const renderValueInput = (condition: WorkflowCondition, index: number) => {
        const fieldType = getFieldType(condition.field_path);

        if (condition.operator === 'between') {
            return (
                <div className="flex gap-2">
                    <Input
                        type="number"
                        value={condition.value[0] || ''}
                        onChange={(e) => updateCondition(index, 'value', [e.target.value, condition.value[1] || ''])}
                        placeholder="Min value"
                    />
                    <span className="self-center text-muted-foreground">to</span>
                    <Input
                        type="number"
                        value={condition.value[1] || ''}
                        onChange={(e) => updateCondition(index, 'value', [condition.value[0] || '', e.target.value])}
                        placeholder="Max value"
                    />
                </div>
            );
        }

        if (fieldType === 'number') {
            return (
                <Input
                    type="number"
                    value={condition.value[0] || ''}
                    onChange={(e) => updateCondition(index, 'value', [e.target.value])}
                    placeholder="Enter value"
                />
            );
        }

        return (
            <Input
                type="text"
                value={condition.value[0] || ''}
                onChange={(e) => updateCondition(index, 'value', [e.target.value])}
                placeholder="Enter value"
            />
        );
    };

    // Group conditions by group_number
    const groupedConditions = conditions.reduce((acc, condition, index) => {
        const groupNum = condition.group_number;
        if (!acc[groupNum]) {
            acc[groupNum] = [];
        }
        acc[groupNum].push({ condition, index });
        return acc;
    }, {} as Record<number, Array<{ condition: WorkflowCondition; index: number }>>);

    const groups = Object.keys(groupedConditions).map(Number).sort();

    if (conditions.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            No conditions added. This step will always execute.
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={() => addCondition(1)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Condition
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Conditions</Label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs text-sm">
                                This step will only execute when ALL conditions are met.
                                Use condition groups to create complex logic with OR operators.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {groups.map((groupNum, groupIndex) => (
                <Card key={groupNum} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                Group {groupNum}
                                {groupIndex > 0 && (
                                    <Badge variant="outline" className="ml-2">OR</Badge>
                                )}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {groupedConditions[groupNum].map(({ condition, index }, condIndex) => (
                            <div key={index} className="space-y-2">
                                {condIndex > 0 && (
                                    <div className="flex items-center">
                                        <Badge variant="secondary" className="text-xs">
                                            {condition.logical_operator.toUpperCase()}
                                        </Badge>
                                    </div>
                                )}
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs">Field</Label>
                                        <Select
                                            value={condition.field_path}
                                            onValueChange={(value) => updateCondition(index, 'field_path', value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select field">
                                                    {availableFields.find(f => f.value === condition.field_path)?.label || 'Select field'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableFields.map((field) => (
                                                    <SelectItem key={field.value} value={field.value}>
                                                        {field.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs">Operator</Label>
                                        <Select
                                            value={condition.operator}
                                            onValueChange={(value) => updateCondition(index, 'operator', value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select operator">
                                                    {getOperatorOptions(condition.field_path).find(op => op.value === condition.operator)?.label || 'Select operator'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getOperatorOptions(condition.field_path).map((op) => (
                                                    <SelectItem key={op.value} value={op.value}>
                                                        {op.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-5 space-y-1">
                                        <Label className="text-xs">Value</Label>
                                        {renderValueInput(condition, index)}
                                    </div>

                                    <div className="col-span-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0"
                                            onClick={() => removeCondition(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCondition(groupNum)}
                            className="w-full"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add AND Condition
                        </Button>
                    </CardContent>
                </Card>
            ))}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCondition(Math.max(...groups) + 1)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add OR Group
            </Button>
        </div>
    );
}
