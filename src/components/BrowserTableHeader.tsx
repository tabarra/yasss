import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortField = "name" | "type" | "size" | "modified";
export type SortDirection = "asc" | "desc";
export type SortState = {
    field: SortField;
    direction: SortDirection;
};

type BrowserTableHeaderProps = {
    label: string;
    field: SortField;
    currentSort: SortState;
    onSort: (field: SortField) => void;
    className?: string;
};

export default function BrowserTableHeader({
    label,
    field,
    currentSort,
    onSort,
    className,
}: BrowserTableHeaderProps) {
    const isActive = currentSort.field === field;
    const isAscending = isActive && currentSort.direction === "asc";
    const isDescending = isActive && currentSort.direction === "desc";

    return (
        <div 
            className={cn(
                "flex items-center gap-1 px-3 py-2 font-medium text-sm cursor-pointer select-none",
                isActive && "text-primary",
                className
            )}
            onClick={() => onSort(field)}
        >
            <span>{label}</span>
            {isAscending && <ArrowDownIcon className="h-3.5 w-3.5" />}
            {isDescending && <ArrowUpIcon className="h-3.5 w-3.5" />}
        </div>
    );
} 
