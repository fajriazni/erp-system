// Purchase Orders TypeScript Types
// Matching backend Value Objects and Models

export interface PurchaseOrder {
    id: number;
    document_number: string;
    vendor_id: number;
    warehouse_id: number;
    date: string;
    status: OrderStatus;
    notes: string | null;
    purchase_request_id: number | null;
    payment_term_id: number | null;
    
    // Amounts
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    withholding_tax_rate: number;
    withholding_tax_amount: number;
    tax_inclusive: boolean;
    total: number;
    
    // Relationships
    vendor?: Contact;
    warehouse?: Warehouse;
    items?: PurchaseOrderItem[];
    workflowInstances?: WorkflowInstance[];
    
    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    product_id: number;
    description: string | null;
    quantity: number;
    uom_id: number | null;
    unit_price: number;
    subtotal: number;
    
    // Relationships
    product?: Product;
    uom?: UnitOfMeasure;
}

export type OrderStatus = 
    | 'draft'
    | 'to_approve'
    | 'open'
    | 'partially_received'
    | 'closed'
    | 'cancelled';

export interface OrderStatusConfig {
    label: string;
    description: string;
    stockEffect: string;
    canEdit: boolean;
    canSubmit: boolean;
    canApprove: boolean;
    canCancel: boolean;
    canReceive: boolean;
}

export interface TaxCalculationBreakdown {
    subtotal: number;
    subtotal_excluding_tax: number;
    tax_rate: number;
    tax_amount: number;
    withholding_tax_rate: number;
    withholding_tax_amount: number;
    total: number;
    net_total: number;
    tax_inclusive: boolean;
    currency: string;
}

export interface ApprovalLevel {
    level: number;
    label: string;
    description: string;
    approver: string;
    maxAmount: number;
}

export interface Contact {
    id: number;
    name: string;
    type: 'vendor' | 'customer' | 'both';
    email?: string;
    phone?: string;
}

export interface Warehouse {
    id: number;
    name: string;
    code: string;
}

export interface Product {
    id: number;
    name: string;
    code: string;
    uom_id: number;
    uom?: UnitOfMeasure;
}

export interface UnitOfMeasure {
    id: number;
    name: string;
    symbol: string;
}

export interface WorkflowInstance {
    id: number;
    workflow_id: number;
    entity_type: string;
    entity_id: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    initiated_by: number;
    workflow?: Workflow;
    currentStep?: WorkflowStep;
    approvalTasks?: ApprovalTask[];
}

export interface Workflow {
    id: number;
    name: string;
    module: string;
    entity_type: string;
    description: string;
    is_active: boolean;
    steps?: WorkflowStep[];
}

export interface WorkflowStep {
    id: number;
    workflow_id: number;
    step_number: number;
    name: string;
    description: string;
    action_type: string;
    assigned_to_role_id: number | null;
    is_required: boolean;
}

export interface ApprovalTask {
    id: number;
    workflow_instance_id: number;
    workflow_step_id: number;
    assigned_to_user_id: number | null;
    assigned_to_role_id: number | null;
    status: 'pending' | 'approved' | 'rejected';
    approved_at: string | null;
    user?: User;
    role?: Role;
    workflowStep?: WorkflowStep;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Role {
    id: number;
    name: string;
}
