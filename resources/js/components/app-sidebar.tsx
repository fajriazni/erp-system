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
  useSidebar,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Box,
    Truck,
    FileText,
    CreditCard,
    UserCircle,
    Building2,
    Calendar,
    Briefcase,
    FileSpreadsheet,
    Receipt,
    Wallet,
    Factory,
    Hammer,
    Clock,
    Clipboard,
    Tv,
    Ticket,
    CheckSquare,
    Scale,
    Tags,
    GitBranch,
    CheckCircle2,
    Undo2
} from "lucide-react"
import { Link, usePage } from "@inertiajs/react"
import { ModuleSwitcher, modules } from "@/components/module-switcher"
import { useMemo } from "react"

// Types for navigation
type NavItem = {
    title: string
    url: string
    icon: any
}

// Menu definitions per module
const menuMap: Record<string, { group: string; items: NavItem[] }[]> = {
    '/dashboard': [
        {
            group: 'Overview',
            items: [
                 { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
            ]
        },
        {
            group: 'Master Data',
            items: [
                { title: "Users", url: "/master/users", icon: Users },
                { title: "Roles", url: "/master/roles", icon: Clipboard },
                { title: "Products", url: "/master/products", icon: Package },
                { title: "Contacts", url: "/master/contacts", icon: UserCircle },
                { title: "Units of Measure", url: "/master/uoms", icon: Scale },
                { title: "Categories", url: "/master/categories", icon: Tags },
                { title: "Warehouses", url: "/master/warehouses", icon: Building2 },
            ]
        }
    ],
    '/inventory': [
        {
            group: 'Inventory Management',
            items: [
                { title: "Dashboard", url: "/inventory", icon: LayoutDashboard },
                { title: "Products", url: "/inventory/products", icon: Box },
                { title: "Stock Moves", url: "/inventory/moves", icon: Truck },
            ]
        },
    ],
    '/purchasing': [
        {
            group: 'Procurement',
            items: [
                { title: "Dashboard", url: "/purchasing", icon: LayoutDashboard },
                // Placeholder for Purchase Request
                { title: "Purchase Requests", url: "/purchasing/requests", icon: FileText },
                { title: "Purchase RFQs", url: "/purchasing/rfqs", icon: Clipboard },
                { title: "Purchase Orders", url: "/purchasing/orders", icon: ShoppingCart },
                { title: "Goods Receipts", url: "/purchasing/receipts", icon: Box },
                { title: "Vendor Bills", url: "/purchasing/bills", icon: Receipt },
                { title: "Vendor Payments", url: "/purchasing/payments", icon: Wallet },
                { title: "Purchase Returns", url: "/purchasing/returns", icon: Undo2 },
                { title: "Price Lists", url: "/purchasing/pricelists", icon: Tags },
                { title: "Approval Rules", url: "/admin/approval-rules", icon: CheckCircle2 },
                { title: "Reports", url: "/purchasing/reports", icon: FileSpreadsheet },
            ]
        },
        {
            group: 'Master Data',
            items: [
                { title: "Vendors", url: "/purchasing/vendors", icon: Users },
                { title: "Products", url: "/master/products", icon: Package }, // Linked from Master
            ]
        }
    ],
    '/sales': [
        {
             group: 'Sales & CRM',
             items: [
                { title: "Dashboard", url: "/sales", icon: LayoutDashboard },
                { title: "Quotations", url: "/sales/quotations", icon: FileText },
                { title: "Invoices", url: "/sales/invoices", icon: CreditCard },
                { title: "Customers", url: "/sales/customers", icon: Users },
             ]
        }
    ],
    '/accounting': [
        {
            group: 'Finance',
            items: [
                { title: "Dashboard", url: "/accounting", icon: LayoutDashboard },
                { title: "Journal Entries", url: "/accounting/journals", icon: FileSpreadsheet },
                { title: "Invoices", url: "/accounting/invoices", icon: FileText },
                { title: "Bills", url: "/accounting/bills", icon: Receipt },
                { title: "Bank & Cash", url: "/accounting/bank", icon: Wallet },
            ]
        },
    ],
    '/hrm': [
        {
            group: 'Human Resources',
            items: [
                { title: "Dashboard", url: "/hrm", icon: LayoutDashboard },
                { title: "Employees", url: "/hrm/employees", icon: UserCircle },
                { title: "Departments", url: "/hrm/departments", icon: Building2 },
                { title: "Attendance", url: "/hrm/attendance", icon: Calendar },
                { title: "Jobs", url: "/hrm/jobs", icon: Briefcase },
            ]
        }
    ],
    '/mrp': [
        {
            group: 'Manufacturing',
            items: [
                { title: "Dashboard", url: "/mrp", icon: LayoutDashboard },
                { title: "Manufacturing Orders", url: "/mrp/orders", icon: Factory },
                { title: "Bill of Materials", url: "/mrp/bom", icon: FileText },
                { title: "Work Centers", url: "/mrp/work-centers", icon: Settings },
            ]
        }
    ],
    '/projects': [
        {
            group: 'Project Management',
            items: [
                { title: "Dashboard", url: "/projects", icon: LayoutDashboard },
                { title: "Projects", url: "/projects/list", icon: Briefcase },
                { title: "Tasks", url: "/projects/tasks", icon: CheckSquare },
                { title: "Timesheets", url: "/projects/timesheets", icon: Clock },
            ]
        }
    ],
    '/assets': [
        {
            group: 'Assets',
            items: [
                 { title: "Dashboard", url: "/assets", icon: LayoutDashboard },
                 { title: "Assets", url: "/assets/list", icon: Building2 },
                 { title: "Depreciation", url: "/assets/depreciation", icon: Calendar },
            ]
        }
    ],
    '/pos': [
        {
            group: 'Point of Sale',
            items: [
                { title: "Dashboard", url: "/pos", icon: LayoutDashboard },
                { title: "Sessions", url: "/pos/sessions", icon: Tv },
                { title: "Orders", url: "/pos/orders", icon: ShoppingCart },
            ]
        }
    ],
    '/fleet': [
        {
            group: 'Fleet',
            items: [
                 { title: "Dashboard", url: "/fleet", icon: LayoutDashboard },
                 { title: "Vehicles", url: "/fleet/vehicles", icon: Truck },
                 { title: "Odometer", url: "/fleet/odometer", icon: Settings },
            ]
        }
    ],
    '/workflows': [
        {
            group: 'Workflow Automation',
            items: [
                { title: "My Approvals", url: "/workflows/my-approvals", icon: CheckCircle2 },
                { title: "Workflow Management", url: "/workflows/management", icon: GitBranch },
                { title: "Workflow Instances", url: "/workflows/instances", icon: FileSpreadsheet },

            ]
        }
    ],
    '/helpdesk': [
      {
           group: 'Helpdesk',
           items: [
              { title: "Dashboard", url: "/helpdesk", icon: LayoutDashboard },
              { title: "Tickets", url: "/helpdesk/tickets", icon: Ticket },
           ]
      }
    ]
}

// Default menu (fallback)
// Default menu (fallback)
const defaultMenu = [
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
                <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title} isActive={url === item.url}>
                            <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
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
