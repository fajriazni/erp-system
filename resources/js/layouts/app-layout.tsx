import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Toaster } from "@/components/ui/sonner"
import { useEffect } from "react"
import { usePage, Link } from "@inertiajs/react"
import { toast } from "sonner"

export default function AppLayout({
  breadcrumbs,
  children,
}: {
  breadcrumbs?: { title: string; href?: string }[]
  children: React.ReactNode
}) {
  const { flash } = usePage().props as any;

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

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
                    {breadcrumbs && breadcrumbs.map((crumb, index) => (
                        <BreadcrumbItem key={index} className="hidden md:block">
                             {index < breadcrumbs.length - 1 ? (
                                <Link href={crumb.href || '#'} className="transition-colors hover:text-foreground">
                                    {crumb.title}
                                </Link>
                             ) : (
                                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                             )}
                             {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                        </BreadcrumbItem>
                    ))}
                    {(!breadcrumbs || breadcrumbs.length === 0) && (
                        <BreadcrumbItem>
                             <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                    )}
                </BreadcrumbList>
             </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
