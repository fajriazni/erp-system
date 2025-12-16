import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({
  breadcrumbs,
  children,
}: {
  breadcrumbs?: { title: string; href?: string }[]
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Toaster />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length -1].title : 'Dashboard'}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
             </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
