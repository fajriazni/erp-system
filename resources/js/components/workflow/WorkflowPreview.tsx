import { Workflow, WorkflowStep } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, CheckCircle2, Clock, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface WorkflowPreviewProps {
    workflow: Partial<Workflow>;
}

export default function WorkflowPreview({ workflow }: WorkflowPreviewProps) {
    const { steps = [] } = workflow;

    if (steps.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Workflow Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Add steps to see workflow preview
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getConditionSummary = (step: WorkflowStep): string => {
        if (!step.conditions || step.conditions.length === 0) {
            return 'Always executes';
        }

        const groups = step.conditions.reduce((acc, cond) => {
            if (!acc[cond.group_number]) {
                acc[cond.group_number] = [];
            }
            acc[cond.group_number].push(cond);
            return acc;
        }, {} as Record<number, typeof step.conditions>);

        const groupSummaries = Object.values(groups).map(groupConds => {
            return groupConds.map(c => 
                `${c.field_path} ${c.operator} ${Array.isArray(c.value) ? c.value.join(', ') : c.value}`
            ).join(` ${groupConds[0].logical_operator.toUpperCase()} `);
        });

        return groupSummaries.length > 1 
            ? `(${groupSummaries.join(') OR (')})`
            : groupSummaries[0];
    };

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Workflow Flow
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Start */}
                <div className="flex items-center gap-2 py-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Start (Draft)</span>
                </div>

                {/* Steps */}
                {steps.map((step, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-center py-1">
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <Card className="border-l-4 border-l-primary/50">
                            <CardContent className="p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium text-sm">
                                            Step {index + 1}: {step.name || 'Unnamed'}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {getConditionSummary(step)}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {step.step_type}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{step.approver_ids.length} approver(s)</span>
                                    </div>
                                    {step.sla_hours && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{step.sla_hours}h SLA</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                {/* End */}
                <div className="flex items-center justify-center py-1">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 py-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">End (Approved)</span>
                </div>
            </CardContent>
        </Card>
    );
}
