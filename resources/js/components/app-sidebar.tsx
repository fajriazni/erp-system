import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Box,
    FileText,
    CreditCard,
    UserCircle,
    Building2,
    Calendar,
    Briefcase,
    Receipt,
    Wallet,
    Factory,
    Clock,
    Ticket,
    CheckSquare,
    Scale,
    Tags,
    GitBranch,
    CheckCircle2,
    Undo2,
    Barcode,
    ArrowRightLeft,
    ClipboardList,
    Trash2,
    Layers,
    BarChart,
    CalendarDays,
    RefreshCw,
    PieChart,
    LineChart,
    Activity,
    Shield,
    Globe,
    Database,
    Server,
    FileSignature,
    History,
    UserPlus,
    UserCog,
    Award,
    BookOpen,
    GanttChartSquare,
    Target,
    Users2,
    HardHat,
    Hammer,
    ClipboardCheck,
    Archive,
    TrendingUp,
    AlertTriangle,
    MessageSquare,
    FolderOpen,
    FileSpreadsheet,
    Calculator,
    Wrench,
    ScanBarcode,
    FileCheck,
    Monitor,
    Store,
    Gift,
    Percent,
    Star,
    MessageCircle,
    ChefHat,
    Gauge,
    Fuel,
    Map,
    AlertOctagon,
    Key,
    Disc,
    Mail,
    MessagesSquare,
    Zap,
    BookMarked,
    RefreshCcw,
    Brain,
    Sparkles,
    CloudCog,
    Lock,
    Network,
    Cog,
    FileEdit,
    ServerCog,
    DollarSign,
    Grid3x3,
    Bell,
    Timer,
    Scaling,
    Gavel,
    FileSearch,
    Undo,
    HardDriveDownload,
    ShieldCheck,
    PackageCheck,
    HelpCircle,
    Hourglass,
    Megaphone,
    MapPin,
    MousePointer2,
    ShieldAlert,
    Banknote,
    Gem,
    Landmark,
    FilePieChart,
    ArrowUpDown,
    ListTree,
    Truck,
    GraduationCap,
    HeartHandshake,
    UserRoundSearch,
    Newspaper,
    Stethoscope,
    HandCoins,
} from "lucide-react"
import { Link, usePage } from "@inertiajs/react"
import { ModuleSwitcher, modules } from "@/components/module-switcher"
import { useMemo } from "react"

// Types for navigation
type NavItem = {
    title: string
    url: string
    icon: any
    badge?: string
}

type MenuGroup = {
    group: string
    items: NavItem[]
    badge?: string
}

// Menu definitions per module
const menuMap: Record<string, MenuGroup[]> = {
    '/dashboard': [
        {
            group: 'Key Performance Indicators (KPI)',
            items: [
                { title: "Financial Health", url: "/dashboard/kpi/financial", icon: DollarSign },
                { title: "Sales Performance", url: "/dashboard/kpi/sales", icon: TrendingUp },
                { title: "Operational Metrics", url: "/dashboard/kpi/ops", icon: Activity },
            ]
        },
        {
            group: 'Graphic Analytics',
            items: [
                { title: "Sales Trends", url: "/dashboard/analytics/sales", icon: LineChart },
                { title: "Expense Breakdown", url: "/dashboard/analytics/expenses", icon: PieChart },
                { title: "Inventory Level", url: "/dashboard/analytics/inventory", icon: BarChart },
                { title: "Production Progress", url: "/dashboard/analytics/mrp", icon: Factory },
            ]
        },
        {
            group: 'Quick Actions',
            items: [
                { title: "Create New Transaction", url: "/dashboard/actions/create", icon: Zap },
                { title: "Approval List", url: "/dashboard/actions/approvals", icon: CheckCircle2 },
            ]
        },
        {
            group: 'Recent Activity',
            items: [
                { title: "Global Feed", url: "/dashboard/activity", icon: History },
                { title: "Company News", url: "/dashboard/news", icon: Newspaper },
            ]
        },
        {
            group: 'Calendar & Agenda',
            items: [
                { title: "Payment Deadlines", url: "/dashboard/agenda/deadlines", icon: CalendarDays },
                { title: "Maintenance Schedule", url: "/dashboard/agenda/maintenance", icon: Wrench },
                { title: "Project Milestones", url: "/dashboard/agenda/milestones", icon: Target },
            ]
        },
        {
            group: 'System Administration',
            items: [
                { title: "Users", url: "/master/users", icon: Users },
                { title: "Roles & Security", url: "/master/roles", icon: Shield },
                { title: "Master Products", url: "/master/products", icon: Package },
                { title: "Master Contacts", url: "/master/contacts", icon: UserCircle },
                { title: "System Config", url: "/admin/settings", icon: Cog },
            ]
        }
    ],

    '/purchasing': [
        {
            group: 'Strategy & Dashboard',
            items: [
                { title: "Performance KPI", url: "/purchasing", icon: LayoutDashboard },
                { title: "Spend Analysis", url: "/purchasing/analytics/spend", icon: PieChart },
                { title: "Contract Compliance", url: "/purchasing/analytics/compliance", icon: ShieldCheck },
                { title: "PR Monitor", url: "/purchasing/analytics/pr-monitor", icon: Activity },
            ]
        },
        {
            group: 'Sourcing & SRM',
            badge: 'Ready',
            items: [
                { title: "Supplier Registry", url: "/purchasing/vendors", icon: Users },
                { title: "Vendor Onboarding", url: "/purchasing/vendors/onboarding", icon: UserPlus },
                { title: "Qualification & Audit", url: "/purchasing/vendors/audits", icon: FileCheck },
                { title: "Supplier Scorecard", url: "/purchasing/vendors/scorecards", icon: Award },

            ]
        },
        {
            group: 'Contracts & Blanket Orders',
            badge: 'On Progress',
            items: [
                { title: "Purchase Agreements", url: "/purchasing/contracts", icon: FileSignature },
                { title: "Blanket Orders", url: "/purchasing/blanket-orders", icon: Layers },
                { title: "Renewal Alerts", url: "/purchasing/contracts/alerts", icon: Bell },
            ]
        },
        {
            group: 'Purchasing Operations',
            badge: 'Ready',
            items: [
                { title: "Purchase Requisitions", url: "/purchasing/requests", icon: ClipboardList },
                { title: "RFQ & Tenders", url: "/purchasing/rfqs", icon: Gavel },
                { title: "Purchase Orders", url: "/purchasing/orders", icon: ShoppingCart },
                { title: "Direct Purchasing", url: "/purchasing/direct", icon: Zap },
                { title: "Revisions & Versions", url: "/purchasing/orders/versions", icon: History },
            ]
        },
        {
            group: 'Receiving & QC',
            items: [
                { title: "Goods Receipt (GR)", url: "/purchasing/receipts", icon: PackageCheck },
                { title: "Three-Way Match", icon: RefreshCcw, url: "/purchasing/matching" },
                { title: "Quality Inspection", url: "/purchasing/qc", icon: FileSearch },
                { title: "Landed Costs", icon: Calculator, url: "/purchasing/landed-costs" },
            ]
        },
        {
            group: 'Returns & Claims',
            items: [
                { title: "Purchase Returns (RMA)", url: "/purchasing/returns", icon: Undo },
                { title: "Debit Notes", url: "/purchasing/debit-notes", icon: Receipt },
                { title: "Vendor Claims", url: "/purchasing/claims", icon: HelpCircle },
            ]
        },
        {
            group: 'Strategic Reporting',
            items: [
                { title: "Price Variance", url: "/purchasing/reports/variance", icon: Scaling },
                { title: "Open PO Aging", url: "/purchasing/reports/aging", icon: Hourglass },
                { title: "History Analytics", url: "/purchasing/reports/history", icon: BarChart },
            ]
        },
        {
            group: 'Documentation',
            items: [
                { title: "Sourcing & SRM Guide", url: "/purchasing/documentation/srm-guide", icon: BookOpen },
                { title: "Purchasing Ops Guide", url: "/purchasing/documentation/ops-guide", icon: ClipboardList },
            ]
        }
    ],
    '/sales': [
        {
            group: 'Sales Intelligence',
            items: [
                { title: "Dashboard", url: "/sales", icon: LayoutDashboard },
                { title: "Pipeline Analytics", url: "/sales/analytics/pipeline", icon: GitBranch },
                { title: "Sales Forecast", url: "/sales/analytics/forecast", icon: TrendingUp },
                { title: "Win/Loss Analysis", url: "/sales/analytics/win-loss", icon: BarChart },
                { title: "Activity Monitor", url: "/sales/analytics/activities", icon: Activity },
            ]
        },
        {
            group: 'CRM (Customer Management)',
            items: [
                { title: "Leads Management", url: "/sales/leads", icon: UserPlus, badge: 'Ready' },
                { title: "Deals", url: "/sales/deals", icon: Target, badge: 'Ready' },
                { title: "Customer 360 View", url: "/sales/customers", icon: UserCircle },
                { title: "Marketing Campaigns", url: "/sales/campaigns", icon: Megaphone },
                { title: "Contact Management", url: "/sales/contacts", icon: Users },
            ]
        },
        {
            group: 'Sales Operations (CPQ)',
            items: [
                { title: "Quotations (CPQ)", url: "/sales/quotations", icon: FileText, badge: 'Ready' },
                { title: "Sales Orders (SO)", url: "/sales/orders", icon: ShoppingCart, badge: 'Ready' },
                { title: "Contract Management", url: "/sales/contracts", icon: FileSignature },
                { title: "Master Price Lists", url: "/sales/price-lists", icon: Tags, badge: 'Ready' },
                { title: "Upsell/Cross-sell", url: "/sales/suggestions", icon: Sparkles },
            ]
        },
        {
            group: 'Sales Force Automation (SFA)',
            items: [
                { title: "Territory Management", url: "/sales/territories", icon: Map },
                { title: "Sales Commission", url: "/sales/commissions", icon: DollarSign },
                { title: "Route Planning", url: "/sales/routes", icon: MapPin },
                { title: "Visit Logs", url: "/sales/visits", icon: ClipboardList },
            ]
        },
        {
            group: 'Multi-Channel & Fulfillment',
            items: [
                { title: "E-commerce Sync", url: "/sales/sync", icon: RefreshCcw },
                { title: "Available-to-Promise", url: "/sales/atp", icon: PackageCheck },
                { title: "Credit Limit Check", url: "/sales/credit-check", icon: ShieldAlert },
                { title: "Delivery Tracking", url: "/sales/delivery", icon: Truck },
            ]
        },
        {
            group: 'Customer Portal',
            items: [
                { title: "Order Tracking", url: "/sales/portal/orders", icon: MousePointer2 },
                { title: "Online Payments", url: "/sales/portal/payments", icon: CreditCard },
                { title: "Document Downloads", url: "/sales/portal/documents", icon: HardDriveDownload },
            ]
        }
    ],
    '/accounting': [
        {
            group: 'Financial Intelligence',
            items: [
                { title: "Executive Dashboard", url: "/accounting", icon: LayoutDashboard },
                { title: "Financial Ratios", url: "/accounting/analytics/ratios", icon: BarChart },
                { title: "P&L Analytics", url: "/accounting/analytics/pl", icon: FilePieChart },
                { title: "Cash Flow Forecast", url: "/accounting/analytics/cashflow", icon: TrendingUp },
                { title: "Budget vs Actual", url: "/accounting/analytics/budget", icon: Target },
            ]
        },
        {
            group: 'General Ledger',
            items: [
                { title: "Chart of Accounts", url: "/accounting/coa", icon: ListTree, badge: 'Ready' },
                { title: "Journal Entries", url: "/accounting/journal-entries", icon: FileText, badge: 'Ready' },
                { title: "Journal Templates", url: "/accounting/templates", icon: ClipboardList, badge: 'Ready' },
                { title: "Account Hierarchy", url: "/accounting/hierarchy", icon: Layers, badge: 'Ready' },
                { title: "Audit Trail", url: "/accounting/audit", icon: History, badge: 'Ready' },
            ]
        },
        {
            group: 'Accounts Receivable (AR)',
            items: [
                { title: "Customer Invoices", url: "/accounting/ar/invoices", icon: Receipt, badge: 'Ready' },
                { title: "Payment Matching", url: "/accounting/ar/matching", icon: CheckCircle2 },
                { title: "AR Aging Report", url: "/accounting/ar/aging", icon: Hourglass },
                { title: "Dunning Mgmt", url: "/accounting/ar/dunning", icon: Bell },
                { title: "Credit Control", url: "/accounting/ar/credit", icon: ShieldCheck },
            ]
        },
        {
            group: 'Accounts Payable (AP)',
            items: [
                { title: "Vendor Bills", url: "/accounting/ap/bills", icon: Receipt, badge: 'Ready' },
                { title: "Payment Runs", url: "/accounting/ap/payments", icon: Banknote },
                { title: "AP Aging Report", url: "/accounting/ap/aging", icon: Hourglass },
                { title: "Debit Notes", url: "/accounting/ap/debit-notes", icon: Undo },
            ]
        },
        {
            group: 'Consolidation & Consol',
            items: [
                { title: "Inter-Company", url: "/accounting/consol/intercompany", icon: ArrowUpDown },
                { title: "Financial Consolidation", url: "/accounting/consol/reports", icon: Gem },
                { title: "Currency Revaluation", url: "/accounting/consol/revaluation", icon: RefreshCcw },
            ]
        },
        {
            group: 'Asset & Tax Mgmt',
            items: [
                { title: "Asset Depreciation", url: "/accounting/assets/depreciation", icon: Calculator },
                { title: "Tax Management", url: "/accounting/tax", icon: Gavel },
                { title: "Deferred Rev/Exp", url: "/accounting/deferred", icon: Timer },
            ]
        },
        {
            group: 'Bank & Cash',
            items: [
                { title: "Bank Sync", url: "/accounting/bank/sync", icon: Landmark },
                { title: "Reconciliation", url: "/accounting/bank/reconciliation", icon: Scale },
                { title: "Petty Cash", url: "/accounting/bank/petty-cash", icon: Wallet },
            ]
        },
        {
            group: 'Closing & Reporting',
            items: [
                { title: "Period End Closing", url: "/accounting/closing", icon: Lock },
                { title: "Standard Reports", url: "/accounting/reports", icon: FileSpreadsheet },
                { title: "Analytical Reports", url: "/accounting/reports/analytical", icon: PieChart },
                { title: "Audit Export", url: "/accounting/audit/export", icon: HardDriveDownload },
            ]
        }
    ],
    '/finance': [
        {
            group: 'Financial Strategy & Dashboard',
            items: [
                { title: "Cash Flow Forecast", url: "/finance/forecast", icon: TrendingUp },
                { title: "Liquidity Ratio", url: "/finance/ratios", icon: Activity },
                { title: "Spend Analysis", url: "/finance/spend", icon: PieChart },
                { title: "Financial Health", url: "/finance/health", icon: ClipboardCheck },
            ]
        },
        {
            group: 'Accounts Receivable (AR)',
            items: [
                { title: "Customer Invoicing", url: "/finance/ar/invoices", icon: Receipt },
                { title: "Payment Collection", url: "/finance/ar/collections", icon: HandCoins },
                { title: "AR Aging Analysis", url: "/finance/ar/aging", icon: Hourglass },
                { title: "Dunning Management", url: "/finance/ar/dunning", icon: Bell },
                { title: "Credit Limit Mgmt", url: "/finance/ar/credit-limit", icon: ShieldAlert },
            ]
        },
        {
            group: 'Accounts Payable (AP)',
            items: [
                { title: "Vendor Bill Verification", url: "/finance/ap/verification", icon: FileCheck },
                { title: "Payment Scheduling", url: "/finance/ap/scheduling", icon: CalendarDays },
                { title: "AP Aging Analysis", url: "/finance/ap/aging", icon: Hourglass },
                { title: "Debit Notes", url: "/finance/ap/debit-notes", icon: Undo2 },
            ]
        },
        {
            group: 'Cash & Bank Management',
            items: [
                { title: "Bank Reconciliation", url: "/finance/cash/reconciliation", icon: Scale },
                { title: "Petty Cash", url: "/finance/cash/petty-cash", icon: Wallet },
                { title: "Fund Transfer", url: "/finance/cash/transfer", icon: ArrowRightLeft },
                { title: "Multi-Currency Reval", url: "/finance/cash/revaluation", icon: RefreshCw },
            ]
        },
        {
            group: 'Budgeting & Control',
            items: [
                { title: "Budget Planning", url: "/finance/budget/planning", icon: Target },
                { title: "Budget Allocation", url: "/finance/budget/allocation", icon: PieChart },
                { title: "Budget vs Actual", url: "/finance/budget/monitoring", icon: Activity },
            ]
        },
        {
            group: 'Expense Management',
            items: [
                { title: "Employee Reimbursements", url: "/finance/expenses/reimbursements", icon: Receipt },
                { title: "Travel Expenses", url: "/finance/expenses/travel", icon: Briefcase },
                { title: "Corporate Cards", url: "/finance/expenses/cards", icon: CreditCard },
            ]
        },
        {
            group: 'Tax & Compliance',
            items: [
                { title: "VAT/PPN Tracking", url: "/finance/tax/vat", icon: Percent },
                { title: "Withholding Tax (PPh)", url: "/finance/tax/withholding", icon: FileSpreadsheet },
                { title: "Tax Reporting", url: "/finance/tax/reporting", icon: FileText },
            ]
        }
    ],

    '/hrm': [
        {
            group: 'HR Intelligence',
            items: [
                { title: "Executive Dashboard", url: "/hrm", icon: LayoutDashboard },
                { title: "Workforce Overview", url: "/hrm/analytics/workforce", icon: Users },
                { title: "Turnover Analysis", url: "/hrm/analytics/turnover", icon: TrendingUp },
                { title: "Labor Cost Monitor", url: "/hrm/analytics/labor-cost", icon: DollarSign },
                { title: "Demographics", url: "/hrm/analytics/demographics", icon: PieChart },
            ]
        },
        {
            group: 'Personnel Data',
            items: [
                { title: "Employee Directory", url: "/hrm/employees", icon: UserCircle, badge: 'Ready' },
                { title: "Contract Mgmt", url: "/hrm/contracts", icon: FileText },
                { title: "Org Chart", url: "/hrm/org-chart", icon: Network },
                { title: "Employee Assets", url: "/hrm/assets", icon: Package },
            ]
        },
        {
            group: 'Time & Attendance',
            items: [
                { title: "Attendance Tracking", url: "/hrm/attendance", icon: Clock, badge: 'Ready' },
                { title: "Shift & Roster", url: "/hrm/shifts", icon: CalendarDays },
                { title: "Overtime Mgmt", url: "/hrm/overtime", icon: Timer },
                { title: "Leave & Time-off", url: "/hrm/leave", icon: Calendar, badge: 'Ready' },
            ]
        },
        {
            group: 'Payroll & Benefits',
            items: [
                { title: "Payroll Processing", url: "/hrm/payroll", icon: Receipt, badge: 'Ready' },
                { title: "Tax (PPh 21)", url: "/hrm/payroll/tax", icon: Gavel },
                { title: "Social Security", url: "/hrm/payroll/bpjs", icon: Stethoscope },
                { title: "Benefit & Loan", url: "/hrm/payroll/benefits", icon: HandCoins },
                { title: "Digital Payslips", url: "/hrm/payroll/payslips", icon: FileText },
            ]
        },
        {
            group: 'Recruitment (ATS)',
            items: [
                { title: "Job Vacancies", url: "/hrm/jobs", icon: Briefcase },
                { title: "Applicant Tracking", url: "/hrm/applicants", icon: UserRoundSearch },
                { title: "Onboarding", url: "/hrm/onboarding", icon: HeartHandshake },
            ]
        },
        {
            group: 'Talent & Performance',
            items: [
                { title: "Performance Appraisal", url: "/hrm/performance", icon: Target },
                { title: "Competency Mapping", url: "/hrm/competency", icon: Layers },
                { title: "Succession Plan", url: "/hrm/succession", icon: Gem },
                { title: "Promotion & Transfer", url: "/hrm/transfers", icon: ArrowRightLeft },
            ]
        },
        {
            group: 'Learning & Development',
            items: [
                { title: "Training Mgmt", url: "/hrm/training", icon: BookOpen },
                { title: "E-learning Portal", url: "/hrm/learning", icon: GraduationCap },
                { title: "Training Budget", url: "/hrm/training/budget", icon: Wallet },
            ]
        },
        {
            group: 'Employee Portal (ESS)',
            items: [
                { title: "My Profile", url: "/hrm/profile", icon: UserCog },
                { title: "Submit Request", url: "/hrm/requests", icon: ClipboardList },
                { title: "Company News", url: "/hrm/news", icon: Newspaper },
            ]
        }
    ],

    '/inventory': [
        {
            group: 'Inventory Performance Dashboard',
            items: [
                { title: "Dashboard Overview", url: "/inventory", icon: LayoutDashboard },
                { title: "Stock Valuation", url: "/inventory/analytics/valuation", icon: FileSpreadsheet },
                { title: "Inventory Turnover", url: "/inventory/analytics/turnover", icon: RefreshCw },
                { title: "Warehouse Occupancy", url: "/inventory/analytics/occupancy", icon: Building2 },
                { title: "Inbound/Outbound Status", url: "/inventory/analytics/status", icon: Activity },
            ]
        },
        {
            group: 'Warehouse Master Data',
            items: [
                { title: "Multi-Warehouse Setup", url: "/inventory/warehouses", icon: Building2 },
                { title: "Location & Bin Mgmt", url: "/inventory/locations", icon: MapPin },
                { title: "Product (Logistics View)", url: "/inventory/products", icon: Package },
                { title: "Putaway & Picking Rules", url: "/inventory/rules", icon: GitBranch },
            ]
        },
        {
            group: 'Inbound Operations',
            items: [
                { title: "Goods Receipt (GR)", url: "/inventory/inbound/receipts", icon: PackageCheck, badge: 'Ready' },
                { title: "Quality Inspection (QC)", url: "/inventory/inbound/qc", icon: FileCheck, badge: 'Ready' },
                { title: "Cross-Docking", url: "/inventory/inbound/cross-dock", icon: RefreshCcw },
                { title: "Landed Cost Integration", url: "/inventory/inbound/landed-costs", icon: Calculator },
            ]
        },
        {
            group: 'Internal Operations',
            items: [
                { title: "Internal Transfer", url: "/inventory/internal/transfers", icon: ArrowRightLeft },
                { title: "Inventory Adjustment", url: "/inventory/internal/adjustments", icon: ClipboardList },
                { title: "Scrapping & Disposal", url: "/inventory/internal/scrap", icon: Trash2 },
                { title: "Auto-Replenishment", url: "/inventory/internal/replenishment", icon: RefreshCcw },
            ]
        },
        {
            group: 'Outbound Operations',
            items: [
                { title: "Picking & Packing", url: "/inventory/outbound/picking", icon: ScanBarcode, badge: 'Ready' },
                { title: "Wave & Batch Picking", url: "/inventory/outbound/waves", icon: Layers },
                { title: "Shipping & Delivery", url: "/inventory/outbound/shipping", icon: Truck },
                { title: "Backorder Management", url: "/inventory/outbound/backorders", icon: Clock },
            ]
        },
        {
            group: 'Inventory Control & Audit',
            items: [
                { title: "Cycle Counting", url: "/inventory/control/cycle-count", icon: RefreshCw },
                { title: "Physical Opname", url: "/inventory/control/opname", icon: ClipboardCheck },
                { title: "Lot & Serial Tracking", url: "/inventory/control/lots", icon: Barcode },
                { title: "Expiry Management", url: "/inventory/control/expiry", icon: Calendar },
            ]
        },
        {
            group: 'Advanced Logistics',
            items: [
                { title: "Reordering Rules", url: "/inventory/advanced/reordering", icon: RefreshCcw },
                { title: "Inventory Forecasting", url: "/inventory/advanced/forecasting", icon: LineChart },
                { title: "Kitting & De-kitting", url: "/inventory/advanced/kitting", icon: Package },
            ]
        }
    ],
    '/mrp': [
        {
            group: 'Production Planning (MRP/MPS)',
            items: [
                { title: "Master Production Schedule", url: "/mrp/mps", icon: CalendarDays },
                { title: "Capacity Planning", url: "/mrp/capacity", icon: BarChart },
            ]
        },
        {
            group: 'Quality (QC)',
            items: [
                { title: "Quality Control Points", url: "/mrp/qc/points", icon: CheckCircle2 },
                { title: "Inspections", url: "/mrp/qc/inspections", icon: ClipboardCheck },
            ]
        },
        {
            group: 'Reporting',
            items: [
                { title: "Production Efficiency", url: "/mrp/reports/efficiency", icon: BarChart },
                { title: "Cost Variance", url: "/mrp/reports/variance", icon: FileSpreadsheet },
            ]
        }
    ],
    '/projects': [
        {
            group: 'Dashboard & Analytics',
            items: [
                { title: "Project Portfolio", url: "/projects", icon: LayoutDashboard },
                { title: "Financial Health", url: "/projects/financial", icon: Banknote },
                { title: "Resource Utilization", url: "/projects/resources/utilization", icon: Users2 },
                { title: "Gantt Master", url: "/projects/gantt", icon: GanttChartSquare },
            ]
        },
        {
            group: 'Planning & Initiation',
            items: [
                { title: "Project Charter", url: "/projects/charter", icon: Target },
                { title: "WBS (Work Breakdown)", url: "/projects/wbs", icon: GitBranch },
                { title: "Budget (CAPEX/OPEX)", url: "/projects/budget", icon: PieChart },
                { title: "Milestone Settings", url: "/projects/milestones", icon: Target },
            ]
        },
        {
            group: 'Resource Management',
            items: [
                { title: "Resource Allocation", url: "/projects/resources/allocation", icon: UserPlus },
                { title: "Timesheets", url: "/projects/timesheets", icon: Clock },
                { title: "Timesheet Approval", url: "/projects/timesheets/approval", icon: CheckCircle2 },
                { title: "External Resources", url: "/projects/resources/external", icon: HardHat },
            ]
        },
        {
            group: 'Execution & Tracking',
            items: [
                { title: "My Tasks", url: "/projects/my-tasks", icon: CheckSquare },
                { title: "Kanban Board", url: "/projects/kanban", icon: LayoutDashboard },
                { title: "Issues & Risks", url: "/projects/issues", icon: AlertTriangle },
                { title: "Documents", url: "/projects/documents", icon: FolderOpen },
                { title: "Collaboration", url: "/projects/collaboration", icon: MessageSquare },
            ]
        },
        {
            group: 'Procurement (Project)',
            items: [
                { title: "Project PR", url: "/projects/procurement/requests", icon: ShoppingCart },
                { title: "Sub-contractors", url: "/projects/procurement/subcontractors", icon: HardHat },
                { title: "Material Consumption", url: "/projects/procurement/consumption", icon: Hammer },
            ]
        },
        {
            group: 'Billing & Finance',
            items: [
                { title: "Revenue Recognition", url: "/projects/billing/revenue", icon: TrendingUp },
                { title: "Milestone Billing", url: "/projects/billing/milestones", icon: Receipt },
                { title: "Expense Claims", url: "/projects/expenses", icon: Wallet },
                { title: "Project P&L", url: "/projects/pnl", icon: FileSpreadsheet },
            ]
        },
        {
            group: 'Quality & Closing',
            items: [
                { title: "QA Checklist", url: "/projects/quality", icon: ClipboardCheck },
                { title: "Handover (BAST)", url: "/projects/handover", icon: FileSignature },
                { title: "Project Closure", url: "/projects/closure", icon: Archive },
            ]
        }
    ],
    '/assets': [
        {
            group: 'Dashboard & Analytics',
            items: [
                { title: "Asset Overview", url: "/assets", icon: LayoutDashboard },
                { title: "Lifecycle Status", url: "/assets/lifecycle", icon: PieChart },
                { title: "Maintenance Calendar", url: "/assets/maintenance-calendar", icon: CalendarDays },
                { title: "Depreciation Forecast", url: "/assets/forecast", icon: TrendingUp },
            ]
        },
        {
            group: 'Asset Registry',
            items: [
                { title: "Asset Master", url: "/assets/list", icon: Building2 },
                { title: "Categorization", url: "/assets/categories", icon: Tags },
                { title: "Location Mapping", url: "/assets/locations", icon: MapPin },
                { title: "Custodians", url: "/assets/custodians", icon: UserCircle },
            ]
        },
        {
            group: 'Financial & Depreciation',
            items: [
                { title: "Depreciation Methods", url: "/assets/methods", icon: Calculator },
                { title: "Asset Revaluation", url: "/assets/revaluation", icon: TrendingUp },
                { title: "Fiscal vs Commercial", url: "/assets/fiscal", icon: BookOpen },
                { title: "Component Accounting", url: "/assets/components", icon: Layers },
            ]
        },
        {
            group: 'Operations',
            items: [
                { title: "Acquisition (Drafts)", url: "/assets/acquisition", icon: ShoppingCart },
                { title: "Asset Transfer", url: "/assets/transfer", icon: ArrowRightLeft },
                { title: "Check-in / Check-out", url: "/assets/checkout", icon: LogOut },
                { title: "Disposal & Scrap", url: "/assets/disposal", icon: Trash2 },
            ]
        },
        {
            group: 'Maintenance (EAM)',
            items: [
                { title: "Preventive Schedule", url: "/assets/preventive", icon: Calendar },
                { title: "Work Orders", url: "/assets/work-orders", icon: Wrench },
                { title: "Insurance Policies", url: "/assets/insurance", icon: Shield },
                { title: "Warranty Tracking", url: "/assets/warranty", icon: Award },
            ]
        },
        {
            group: 'Audit & Compliance',
            items: [
                { title: "Stock Take (Audit)", url: "/assets/audit/stock-take", icon: ScanBarcode },
                { title: "Audit Trail", url: "/assets/audit/log", icon: History },
                { title: "Legal Documents", url: "/assets/documents", icon: FileCheck },
            ]
        }
    ],
    '/pos': [
        {
            group: 'POS Operations',
            items: [
                { title: "Register / Sessions", url: "/pos/sessions", icon: Monitor },
                { title: "Sales Interface", url: "/pos/sales", icon: ShoppingCart },
                { title: "Orders Management", url: "/pos/orders", icon: ClipboardList },
                { title: "Refunds & Returns", url: "/pos/refunds", icon: Undo2 },
            ]
        },
        {
            group: 'Multi-Store & Global',
            items: [
                { title: "Shop & Branches", url: "/pos/branches", icon: Store },
                { title: "Price & Tax Rules", url: "/pos/pricing", icon: Tags },
                { title: "Promotions & Discounts", url: "/pos/promotions", icon: Percent },
                { title: "Vouchers", url: "/pos/vouchers", icon: Gift },
            ]
        },
        {
            group: 'Inventory Integration',
            items: [
                { title: "Inter-Store Transfer", url: "/pos/inventory/transfers", icon: ArrowRightLeft },
                { title: "Stock Take (Branch)", url: "/pos/inventory/stock-take", icon: ScanBarcode },
                { title: "Purchase Requests", url: "/pos/inventory/requests", icon: Archive },
            ]
        },
        {
            group: 'CRM & Loyalty',
            items: [
                { title: "Customers", url: "/pos/customers", icon: Users },
                { title: "Loyalty Points", url: "/pos/loyalty", icon: Star },
                { title: "Membership Tiers", url: "/pos/membership", icon: Award },
                { title: "Feedback", url: "/pos/feedback", icon: MessageCircle },
            ]
        },
        {
            group: 'Multi-Channel',
            items: [
                { title: "Online Orders", url: "/pos/online-orders", icon: Globe },
                { title: "Delivery Tracking", url: "/pos/delivery", icon: Truck },
                { title: "Kitchen Display (KDS)", url: "/pos/kds", icon: ChefHat },
            ]
        },
        {
            group: 'Accounting & Reporting',
            items: [
                { title: "Daily Journal", url: "/pos/reports/journal", icon: FileText },
                { title: "Tax Report", url: "/pos/reports/tax", icon: FileSpreadsheet },
                { title: "Cash Discrepancy", url: "/pos/reports/discrepancy", icon: AlertTriangle },
            ]
        },
        {
            group: 'Analytics & BI',
            items: [
                { title: "Sales Performance", url: "/pos/analytics/sales", icon: BarChart },
                { title: "Top Selling", url: "/pos/analytics/top-selling", icon: TrendingUp },
                { title: "Profit Margin", url: "/pos/analytics/margin", icon: PieChart },
            ]
        }
    ],
    '/fleet': [
        {
            group: 'Dashboard & Analytics',
            items: [
                { title: "Fleet Overview", url: "/fleet", icon: LayoutDashboard },
                { title: "Fuel Analysis", url: "/fleet/analytics/fuel", icon: Fuel },
                { title: "Cost Analysis", url: "/fleet/analytics/costs", icon: PieChart },
                { title: "Telematics (GPS)", url: "/fleet/analytics/telematics", icon: Map },
            ]
        },
        {
            group: 'Vehicle Master Data',
            items: [
                { title: "Vehicle Registry", url: "/fleet/vehicles", icon: Truck }, // or Car
                { title: "Asset Linkage", url: "/fleet/vehicles/assets", icon: Building2 },
                { title: "Odometer Logs", url: "/fleet/vehicles/odometer", icon: Gauge },
                { title: "Fuel Cards", url: "/fleet/vehicles/fuel-cards", icon: CreditCard },
            ]
        },
        {
            group: 'Driver & HR',
            items: [
                { title: "Driver Profiles", url: "/fleet/drivers", icon: UserCircle },
                { title: "License Tracking", url: "/fleet/drivers/licenses", icon: FileCheck },
                { title: "Assignments", url: "/fleet/drivers/assignments", icon: Key },
                { title: "Safety Scorecards", url: "/fleet/drivers/safety", icon: Award },
            ]
        },
        {
            group: 'Maintenance (EAM)',
            items: [
                { title: "Preventive Schedule", url: "/fleet/maintenance/preventive", icon: Calendar },
                { title: "Work Orders", url: "/fleet/maintenance/orders", icon: Wrench },
                { title: "Tire Management", url: "/fleet/maintenance/tires", icon: Disc }, // Disc as placeholder for Tire? Or Circle.
                { title: "Spare Parts", url: "/fleet/maintenance/parts", icon: Box },
            ]
        },
        {
            group: 'Fuel & Expenses',
            items: [
                { title: "Fuel Logs", url: "/fleet/expenses/fuel", icon: Fuel },
                { title: "Expense Claims", url: "/fleet/expenses/claims", icon: Receipt },
                { title: "Fines & Tickets", url: "/fleet/expenses/fines", icon: AlertOctagon },
            ]
        },
        {
            group: 'Booking & Operations',
            items: [
                { title: "Vehicle Booking", url: "/fleet/operations/booking", icon: CalendarDays },
                { title: "Dispatch & Routing", url: "/fleet/operations/dispatch", icon: Map },
                { title: "Trip Logs", url: "/fleet/operations/trips", icon: History },
            ]
        },
        {
            group: 'Compliance & Insurance',
            items: [
                { title: "Documents (STNK/KIR)", url: "/fleet/compliance/documents", icon: FolderOpen },
                { title: "Insurance Policies", url: "/fleet/compliance/insurance", icon: Shield },
                { title: "Tax Management", url: "/fleet/compliance/tax", icon: Banknote },
            ]
        }
    ],
    '/workflows': [
        {
            group: 'Approval Center',
            items: [
                { title: "Pending Requests", url: "/workflows/approvals", icon: FileSignature },
                { title: "Approval History", url: "/workflows/history", icon: History },
                { title: "Delegation Settings", url: "/workflows/delegation", icon: UserPlus },
            ]
        },
        {
            group: 'Configuration',
            items: [
                { title: "Workflow Definitions", url: "/workflows/definitions", icon: GitBranch },
                { title: "SLA Policies", url: "/workflows/sla", icon: Clock },
            ]
        }
    ],
    '/bi': [
        {
            group: 'Executive Dashboards',
            items: [
                { title: "Balanced Scorecard", url: "/bi/executive/scorecard", icon: Target },
                { title: "Financial Health", url: "/bi/executive/financial", icon: Activity },
                { title: "Market Share Analysis", url: "/bi/executive/market", icon: TrendingUp },
                { title: "CAPEX Tracking", url: "/bi/executive/capex", icon: Building2 },
            ]
        },
        {
            group: 'Operational Analytics',
            items: [
                { title: "Sales & Revenue BI", url: "/bi/operations/sales", icon: ShoppingCart },
                { title: "Supply Chain BI", url: "/bi/operations/supply", icon: Package },
                { title: "Human Capital BI", url: "/bi/operations/hr", icon: Users },
                { title: "Manufacturing BI", url: "/bi/operations/manufacturing", icon: Factory },
            ]
        },
        {
            group: 'Financial Intelligence',
            items: [
                { title: "Cash Flow Forecasting", url: "/bi/financial/cashflow", icon: TrendingUp },
                { title: "Profitability Analysis", url: "/bi/financial/profitability", icon: DollarSign },
                { title: "Budget vs Actual", url: "/bi/financial/budget", icon: BarChart },
                { title: "Tax Exposure", url: "/bi/financial/tax", icon: FileSpreadsheet },
            ]
        },
        {
            group: 'Predictive Analytics (AI)',
            items: [
                { title: "Demand Forecasting", url: "/bi/predictive/demand", icon: Brain },
                { title: "Fraud Detection", url: "/bi/predictive/fraud", icon: AlertTriangle },
                { title: "Customer Lifetime Value", url: "/bi/predictive/clv", icon: Users },
                { title: "What-If Analysis", url: "/bi/predictive/whatif", icon: Sparkles },
            ]
        },
        {
            group: 'Data Management',
            items: [
                { title: "Data Sources", url: "/bi/data/sources", icon: Database },
                { title: "Warehouse Status", url: "/bi/data/warehouse", icon: Server },
                { title: "Master Data (MDM)", url: "/bi/data/mdm", icon: FileCheck },
                { title: "Report Scheduler", url: "/bi/data/scheduler", icon: Clock },
            ]
        },
        {
            group: 'Self-Service BI',
            items: [
                { title: "Report Builder", url: "/bi/self/builder", icon: FileEdit },
                { title: "Pivot Analytics", url: "/bi/self/pivot", icon: Grid3x3 },
                { title: "Query Library", url: "/bi/self/queries", icon: BookOpen },
            ]
        }
    ],
    '/admin': [
        {
            group: 'User Access & Security',
            items: [
                { title: "User Management", url: "/admin/users", icon: Users },
                { title: "Roles & Permissions", url: "/admin/roles", icon: Shield },
                { title: "Security Groups", url: "/admin/security/groups", icon: Lock },
                { title: "Access Logs", url: "/admin/security/logs", icon: History },
                { title: "2FA Settings", url: "/admin/security/2fa", icon: Key },
            ]
        },
        {
            group: 'Multi-Entity Setup',
            items: [
                { title: "Company Profile", url: "/admin/company/profile", icon: Building2 },
                { title: "Org Hierarchy", url: "/admin/company/hierarchy", icon: Network },
                { title: "Branches & Cost Centers", url: "/admin/company/branches", icon: MapPin },
                { title: "Currency & Exchange", url: "/admin/company/currency", icon: DollarSign },
            ]
        },
        {
            group: 'Workflow & Automation',
            items: [
                { title: "Approval Workflow Designer", url: "/admin/workflow/designer", icon: GitBranch },
                { title: "Scheduled Actions (Cron)", url: "/admin/workflow/cron", icon: Clock },
                { title: "Notifications", url: "/admin/workflow/notifications", icon: Bell },
                { title: "Webhooks & API", url: "/admin/workflow/api", icon: CloudCog },
            ]
        },
        {
            group: 'Data & Audit',
            items: [
                { title: "Audit Logs", url: "/admin/data/audit", icon: FileCheck },
                { title: "Import/Export", url: "/admin/data/import-export", icon: ArrowRightLeft },
                { title: "Database Management", url: "/admin/data/database", icon: Database },
                { title: "Archiving & Purging", url: "/admin/data/archive", icon: Archive },
            ]
        },
        {
            group: 'Customization',
            items: [
                { title: "Field Customization", url: "/admin/custom/fields", icon: Settings },
                { title: "Form & Report Designer", url: "/admin/custom/forms", icon: FileEdit },
                { title: "Translation & Localization", url: "/admin/custom/translation", icon: Globe },
                { title: "Menu Editor", url: "/admin/custom/menu", icon: Layers },
            ]
        },
        {
            group: 'System Health',
            items: [
                { title: "System Logs", url: "/admin/health/logs", icon: FileText },
                { title: "Integration Dashboard", url: "/admin/health/integrations", icon: Zap },
                { title: "Performance Monitor", url: "/admin/health/performance", icon: Activity },
                { title: "Backup & Recovery", url: "/admin/health/backup", icon: ServerCog },
            ]
        }
    ],
    '/helpdesk': [
        {
            group: 'Dashboard & Insights',
            items: [
                { title: "Support Overview", url: "/helpdesk", icon: LayoutDashboard },
                { title: "SLA Performance", url: "/helpdesk/analytics/sla", icon: Activity },
                { title: "Agent Workload", url: "/helpdesk/analytics/workload", icon: Users },
                { title: "CSAT Scores", url: "/helpdesk/analytics/csat", icon: Star },
            ]
        },
        {
            group: 'Ticket Management',
            items: [
                { title: "All Tickets", url: "/helpdesk/tickets", icon: Ticket },
                { title: "My Pipeline", url: "/helpdesk/tickets/my", icon: UserCircle },
                { title: "Team Tickets", url: "/helpdesk/tickets/team", icon: Users2 },
                { title: "Ticket Views", url: "/helpdesk/tickets/views", icon: ClipboardList },
            ]
        },
        {
            group: 'Omnichannel',
            items: [
                { title: "Email-to-Ticket", url: "/helpdesk/channels/email", icon: Mail },
                { title: "Live Chat & WA", url: "/helpdesk/channels/chat", icon: MessageCircle },
                { title: "Social Media", url: "/helpdesk/channels/social", icon: MessagesSquare },
                { title: "Self-Service Portal", url: "/helpdesk/channels/portal", icon: Globe },
            ]
        },
        {
            group: 'SLA & Automation',
            items: [
                { title: "SLA Policies", url: "/helpdesk/automation/sla", icon: Clock },
                { title: "Auto-Assignment", url: "/helpdesk/automation/assignment", icon: Zap },
                { title: "Escalation Rules", url: "/helpdesk/automation/escalation", icon: AlertTriangle },
                { title: "Action Triggers", url: "/helpdesk/automation/triggers", icon: GitBranch },
            ]
        },
        {
            group: 'Knowledge & Self-Help',
            items: [
                { title: "Knowledge Base", url: "/helpdesk/knowledge/articles", icon: BookOpen },
                { title: "Internal Wiki", url: "/helpdesk/knowledge/wiki", icon: BookMarked }, // Lock or BookLock
                { title: "Canned Responses", url: "/helpdesk/knowledge/canned", icon: MessageSquare },
            ]
        },
        {
            group: 'Field & Project Integration',
            items: [
                { title: "On-site Visit (Fleet)", url: "/helpdesk/integration/onsite", icon: Truck },
                { title: "Project Issue", url: "/helpdesk/integration/project", icon: Briefcase },
                { title: "RMA (Returns)", url: "/helpdesk/integration/rma", icon: RefreshCcw },
            ]
        },
        {
            group: 'Reporting & Compliance',
            items: [
                { title: "Resolution Time", url: "/helpdesk/reports/resolution", icon: Timer },
                { title: "Recurring Issues", url: "/helpdesk/reports/recurring", icon: AlertTriangle },
                { title: "Audit Trail", url: "/helpdesk/reports/audit", icon: History },
            ]
        }
    ]
}

// Default menu (fallback)
const defaultMenu: MenuGroup[] = [
    {
        group: 'Application',
        items: [
            { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        ]
    }
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const { url } = usePage()

    // Determine current active module to render the correct menu
    const activeMenu = useMemo(() => {
        // Special handling for master data to keep it under Dashboard/Core context
        if (url.startsWith('/master')) {
            return menuMap['/dashboard']
        }

        const currentModule = modules.find(m => url.startsWith(m.prefix))
        if (currentModule && menuMap[currentModule.prefix]) {
            return menuMap[currentModule.prefix]
        }
        return defaultMenu
    }, [url])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <ModuleSwitcher />
            </SidebarHeader>
            <SidebarContent>
                {activeMenu.map((group) => (
                    <SidebarGroup key={group.group}>
                        <SidebarGroupLabel>{group.group}
                            {group.badge && (
                                <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                    {group.badge}
                                </span>
                            )}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={url === item.url}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                                {item.badge && (
                                                    <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Settings" isActive={url.startsWith('/settings')}>
                            <Link href="/settings/company">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/logout" method="post" as="button">
                                <LogOut />
                                <span>Sign Out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
