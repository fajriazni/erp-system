import {
  ChevronsUpDown,
  Plus,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ShoppingBag,
  Calculator,
  Factory,
  Briefcase,
  Building2,
  Store,
  Truck,
  Headset,
  GitBranch,
  Wallet,
  PieChart,
  Shield
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ComponentType, useState, useEffect } from "react"
import { Link, usePage } from "@inertiajs/react"

export type Module = {
  name: string
  logo: ComponentType<{ className?: string }>
  plan: string
  url: string
  prefix: string
}

type ModuleGroup = {
  label: string
  modules: Module[]
}

const moduleGroups: ModuleGroup[] = [
  {
      label: "Core Modules",
      modules: [
          { name: "Dashboard", logo: LayoutDashboard, plan: "General", url: "/dashboard", prefix: "/dashboard" },
          { name: "Sales & CRM", logo: ShoppingCart, plan: "Orders & Customers", url: "/sales", prefix: "/sales" },
          { name: "Purchasing", logo: ShoppingBag, plan: "Procurement & Bills", url: "/purchasing", prefix: "/purchasing" },
          { name: "Inventory", logo: Package, plan: "Stock & Warehouse", url: "/inventory", prefix: "/inventory" },
          { name: "Accounting", logo: Calculator, plan: "GL & Taxes", url: "/accounting", prefix: "/accounting" },
          { name: "Finance", logo: Wallet, plan: "Cash, AR & AP", url: "/finance", prefix: "/finance" },
      ]
  },
  {
      label: "Operations",
      modules: [
          { name: "HRM & Payroll", logo: Users, plan: "Employees", url: "/hrm", prefix: "/hrm" },
          { name: "Manufacturing", logo: Factory, plan: "MRP & Quality", url: "/mrp", prefix: "/mrp" },
          { name: "Projects", logo: Briefcase, plan: "Tasks & Planning", url: "/projects", prefix: "/projects" },
          { name: "Assets", logo: Building2, plan: "Depreciation", url: "/assets", prefix: "/assets" },
      ]
  },
  {
      label: "Customer Facing",
      modules: [
          { name: "Point of Sale", logo: Store, plan: "Retail Shop", url: "/pos", prefix: "/pos" },
          { name: "Helpdesk", logo: Headset, plan: "Support Tickets", url: "/helpdesk", prefix: "/helpdesk" },
      ]
  },
  {
      label: "Support & Analytics",
      modules: [
          { name: "Fleet", logo: Truck, plan: "Vehicles", url: "/fleet", prefix: "/fleet" },
          { name: "Workflows", logo: GitBranch, plan: "Approvals & Automation", url: "/workflows/management", prefix: "/workflows" },
          { name: "Business Intelligence", logo: PieChart, plan: "Analytics & KPI", url: "/bi", prefix: "/bi" },
          { name: "System Admin", logo: Shield, plan: "Config & Security", url: "/admin", prefix: "/admin" },
      ]
  }
]

// Flattened list for easy lookup
export const modules: Module[] = moduleGroups.flatMap(g => g.modules)

export function ModuleSwitcher() {
  const { isMobile } = useSidebar()
  const [activeModule, setActiveModule] = useState(modules[0])
  const { url } = usePage()

  // Auto-switch based on URL
  useEffect(() => {
     const current = modules.find(m => url.startsWith(m.prefix))
     if (current) {
         setActiveModule(current)
     }
  }, [url])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeModule.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeModule.name}
                </span>
                <span className="truncate text-xs">{activeModule.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[500px] min-w-56 rounded-lg max-h-[80vh] overflow-y-auto"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {moduleGroups.map((group, index) => (
                <div key={group.label}>
                    {index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-2">
                      {group.label}
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-2 gap-1 p-1">
                        {group.modules.map((module) => (
                        <DropdownMenuItem
                            key={module.name}
                            onClick={() => setActiveModule(module)}
                            asChild
                            className="gap-2 p-2 cursor-pointer"
                        >
                            <Link href={module.url}>
                                <div className="flex size-8 items-center justify-center rounded-md border bg-muted/50">
                                <module.logo className="size-4 shrink-0 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium text-sm">{module.name}</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight">{module.plan}</span>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                        ))}
                    </div>
                </div>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" disabled>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add Module</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
