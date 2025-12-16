import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

interface DataTableProps {
    data: any; // Paginator result
    columns: {
        label: string;
        key: string;
        sortable?: boolean;
        render?: (row: any) => React.ReactNode;
        className?: string;
    }[];
    filters?: {
        key: string;
        label: string;
        options: { label: string; value: string }[];
    }[];
    searchable?: boolean;
    searchPlaceholder?: string;
    routeParams?: any; // Base params like type=customer
    baseUrl: string; // URL for router visits
}

export function DataTable({
    data,
    columns,
    filters = [],
    searchable = true,
    searchPlaceholder = "Search...",
    routeParams = {},
    baseUrl,
}: DataTableProps) {
    // Parse current query params
    const queryParams = new URLSearchParams(window.location.search);
    const initialSort = queryParams.get("sort") || "";
    const initialSearch = queryParams.get("filter[global]") || "";
    const initialFilters = filters.reduce((acc, filter) => {
        acc[filter.key] = queryParams.get(`filter[${filter.key}]`) || "all";
        return acc;
    }, {} as Record<string, string>);

    const [sort, setSort] = useState(initialSort);
    const [search, setSearch] = useState(initialSearch);
    const [filterValues, setFilterValues] = useState(initialFilters);
    const [debouncedSearch] = useDebounce(search, 500);

    // Effect to trigger router visit when params change
    useEffect(() => {
        // Build query object
        const query: any = { ...routeParams };

        if (sort) query.sort = sort;
        if (debouncedSearch) query["filter[global]"] = debouncedSearch;
        
        Object.keys(filterValues).forEach(key => {
            if (filterValues[key] && filterValues[key] !== "all") {
                query[`filter[${key}]`] = filterValues[key];
            }
        });
        
        // Preserve page if it exists in data meta but reset to 1 if search/filter changes
        // Actually, we usually want to reset page to 1 on filter change
        // But if we are just navigating pages, we don't handle it here, pagination links handle it.
        // Wait, if search changes, we MUST reset to page 1.
        
        router.get(baseUrl, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });

    }, [sort, debouncedSearch, filterValues]);

    const handleSort = (key: string) => {
        if (sort === key) {
            setSort(`-${key}`);
        } else if (sort === `-${key}`) {
            setSort("");
        } else {
            setSort(key);
        }
    };

    const getSortIcon = (key: string) => {
        if (sort === key) return <ChevronUp className="ml-2 h-4 w-4" />;
        if (sort === `-${key}`) return <ChevronDown className="ml-2 h-4 w-4" />;
        return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    };

    // Debugging
    console.log('DataTable Render:', { data, columns, filters });

    if (!data) return <div>No data provided.</div>;
    // Handle both paginator object and direct array
    const tableData = Array.isArray(data) ? data : (data.data || []);
    const meta = Array.isArray(data) ? { from: 1, to: data.length, total: data.length } : data;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    {searchable && (
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    )}
                    {(filters || []).map((filter) => (
                        <Select
                            key={filter.key}
                            value={filterValues[filter.key]}
                            onValueChange={(val) => setFilterValues(prev => ({ ...prev, [filter.key]: val }))}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder={filter.label} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All {filter.label}</SelectItem>
                                {(filter.options || []).map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead 
                                    key={col.key} 
                                    className={col.className}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                    style={{ cursor: col.sortable ? "pointer" : "default" }}
                                >
                                    <div className={`flex items-center ${col.className?.includes("text-right") ? "justify-end" : col.className?.includes("text-center") ? "justify-center" : ""}`}>
                                        {col.label}
                                        {col.sortable && getSortIcon(col.key)}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tableData.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    {(columns || []).map((col) => (
                                        <TableCell key={`${row.id}-${col.key}`} className={col.className}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                 <div className="text-sm text-muted-foreground">
                    Showing {meta.from} to {meta.to} of {meta.total} results
                </div>
                <div className="flex items-center gap-2">
                     <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit(data.first_page_url)}
                        disabled={!data.prev_page_url}
                     >
                        <ChevronsLeft className="h-4 w-4" />
                     </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit(data.prev_page_url)}
                        disabled={!data.prev_page_url}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit(data.next_page_url)}
                        disabled={!data.next_page_url}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                     <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit(data.last_page_url)}
                        disabled={!data.next_page_url}
                     >
                        <ChevronsRight className="h-4 w-4" />
                     </Button>
                </div>
            </div>
        </div>
    );
}
