import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { router } from "@inertiajs/react"

interface DataTablePaginationProps {
  links: any[];
}

export function DataTablePagination({
  links,
}: DataTablePaginationProps) {
  // Extract pagination info from Laravel pagination links
  const prevLink = links.find(link => link.label === '&laquo; Previous')?.url;
  const nextLink = links.find(link => link.label === 'Next &raquo;')?.url;
  
  // Basic implementation that handles previous/next. 
  // For full implementation matching shadcn example, we need more props from meta (current_page, last_page etc).
  // But given standard Laravel 'links' array often mixes numbers and prev/next:
  
  // Let's rely on what we have. If just links array, we can iterate. 
  // But usually better to pass meta. In PageProps earlier I defined links: any[].
  // Let's stick to a simple previous/next logic for now if structure is basic Laravel links.
  
  // Actually, standard Laravel resource pagination provides `meta` and `links`.
  // If `invoices` is Paginator, it has `links` array with numbers.
  
  if (!links || links.length === 0) return null;

  return (
    <div className="flex items-center justify-end px-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center text-sm font-medium">
          Page {links.find(l => l.active)?.label || '?'}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => prevLink && router.visit(prevLink)}
            disabled={!prevLink}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => nextLink && router.visit(nextLink)}
            disabled={!nextLink}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
