import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';

interface PaginationLinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface DataTablePaginationProps {
    links: PaginationLinkType[];
    from: number;
    to: number;
    total: number;
    per_page: number;
    onPerPageChange: (value: number) => void;
    // Optional because some tables might handle routing dynamically, 
    // but default behavior is usually just simple Inertia visit.
    // However, the links from Laravel Paginator already have the URL.
    // The previous implementation used `get(link.url)` from `useForm` helper to preserve state.
    // To make this reusable, we might need to accept a callback or just use router.visit if no callback.
    // But `useForm`'s `get` is specific to the form state.
    // Let's make it generic: default to router.visit, but allow overload.
    onPageChange?: (url: string) => void; 
}

export function DataTablePagination({
    links,
    from,
    to,
    total,
    per_page,
    onPerPageChange,
    onPageChange
}: DataTablePaginationProps) {

    // Default handler if none provided, but usually we want to preserve state so parent should provide it.
    const handlePageChange = (url: string | null, e: React.MouseEvent) => {
        e.preventDefault();
        if (!url) return;
        
        if (onPageChange) {
            onPageChange(url);
        } else {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex items-center gap-6">
                 {/* Gap-6 gives a bit more breathing room than gap-2 between the selector group and text */}
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</p>
                    <Select
                        value={String(per_page)}
                        onValueChange={(value) => onPerPageChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={String(per_page)} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={String(pageSize)}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {from} to {to} of {total} results
                </div>
            </div>
            
            <Pagination className="w-auto">
                <PaginationContent>
                    {links.map((link, index) => {
                         // Previous Button
                         if (link.label.includes('Previous')) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationPrevious
                                        href={link.url || '#'}
                                        onClick={(e) => handlePageChange(link.url, e)}
                                        className={!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            );
                        }

                        // Next Button
                        if (link.label.includes('Next')) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationNext
                                        href={link.url || '#'}
                                        onClick={(e) => handlePageChange(link.url, e)}
                                        className={!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            );
                        }

                        // Dots
                        if (link.label === '...') {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        // Number Links
                        return (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    href={link.url || '#'}
                                    isActive={link.active}
                                    onClick={(e) => handlePageChange(link.url, e)}
                                >
                                    {link.label}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                </PaginationContent>
            </Pagination>
        </div>
    );
}
