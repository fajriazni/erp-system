// Workflow-related TypeScript types

export interface WorkflowCondition {
    id?: number;
    field_path: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in' | 'between' | 'contains';
    value: (string | number)[];
    logical_operator: 'and' | 'or';
    group_number: number;
}

export interface WorkflowStep {
    id?: number;
    name: string;
    step_number?: number;
    step_type: 'approval' | 'notification' | 'conditional' | 'parallel';
    approver_type: 'role' | 'user';
    approver_ids: number[];
    approval_type: 'all' | 'any_one' | 'majority';
    sla_hours: number | null;
    conditions: WorkflowCondition[];
}

export interface Workflow {
    id?: number;
    name: string;
    module: string;
    entity_type: string;
    description: string;
    is_active: boolean;
    created_by?: number;
    version?: number;
    steps: WorkflowStep[];
}

export interface Role {
    id: number;
    name: string;
    guard_name?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface WorkflowType {
    id: string;
    label: string;
    children: {
        id: string;
        label: string;
        module: string;
        fields: FieldOption[];
    }[];
}

export interface FieldOption {
    value: string;
    label: string;
    type: 'number' | 'string' | 'date' | 'boolean' | 'array';
}

// Operator options for different field types
export const OPERATORS = {
    number: ['=', '!=', '>', '<', '>=', '<=', 'between'] as const,
    string: ['=', '!=', 'contains'] as const,
    date: ['=', '!=', '>', '<', '>=', '<=', 'between'] as const,
    boolean: ['=', '!='] as const,
    array: ['in', 'not_in'] as const,
} as const;

// Step type labels
export const STEP_TYPE_LABELS = {
    approval: 'Approval',
    notification: 'Notification',
    conditional: 'Conditional',
    parallel: 'Parallel',
} as const;

// Approval type labels
export const APPROVAL_TYPE_LABELS = {
    all: 'All must approve',
    any_one: 'Any one can approve',
    majority: 'Majority must approve',
} as const;
