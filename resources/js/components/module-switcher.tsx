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
  GitBranch
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
  url: string // Root URL for the module
  prefix: string // URL prefix to auto-detect
}

export const modules: Module[] = [
  {
    name: "Dashboard",
    logo: LayoutDashboard,
    plan: "General",
    url: "/dashboard",
    prefix: "/dashboard"
  },
  {
    name: "Inventory",
    logo: Package,
    plan: "Stock & Warehouse",
    url: "/inventory",
    prefix: "/inventory"
  },
  {
    name: "Purchasing",
    logo: ShoppingBag,
    plan: "Procurement & Bills",
    url: "/purchasing",
    prefix: "/purchasing"
  },
  {
    name: "Sales & CRM",
    logo: ShoppingCart,
    plan: "Orders & Customers",
    url: "/sales",
    prefix: "/sales"
  },
  {
    name: "Accounting",
    logo: Calculator,
    plan: "Finance & Reports",
    url: "/accounting",
    prefix: "/accounting"
  },
  {
    name: "HRM & Payroll",
    logo: Users,
    plan: "Employees",
    url: "/hrm",
    prefix: "/hrm"
  },
  {
    name: "Manufacturing",
    logo: Factory,
    plan: "MRP & Quality",
    url: "/mrp",
    prefix: "/mrp"
  },
  {
    name: "Projects",
    logo: Briefcase,
    plan: "Tasks & Planning",
    url: "/projects",
    prefix: "/projects"
  },
  {
    name: "Assets",
    logo: Building2,
    plan: "Depreciation",
    url: "/assets",
    prefix: "/assets"
  },
  {
    name: "Point of Sale",
    logo: Store,
    plan: "Retail Shop",
    url: "/pos",
    prefix: "/pos"
  },
  {
    name: "Fleet",
    logo: Truck,
    plan: "Vehicles",
    url: "/fleet",
    prefix: "/fleet"
  },
  {
    name: "Workflows",
    logo: GitBranch,
    plan: "Approvals & Automation",
    url: "/workflows/management",
    prefix: "/workflows"
  },
  {
    name: "Helpdesk",
    logo: Headset,
    plan: "Support Tickets",
    url: "/helpdesk",
    prefix: "/helpdesk"
  },
]

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
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Modules
            </DropdownMenuLabel>
            {modules.map((module) => (
              <DropdownMenuItem
                key={module.name}
                onClick={() => setActiveModule(module)}
                asChild
                className="gap-2 p-2"
              >
                  <Link href={module.url}>
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <module.logo className="size-4 shrink-0" />
                    </div>
                    {module.name}
                  </Link>
              </DropdownMenuItem>
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
