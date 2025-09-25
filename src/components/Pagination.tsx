import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ page, pageSize, totalItems, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) return null; // hide if only 1 page

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6">
            {/* Item range */}
            <span className="text-sm text-muted-foreground">
                Showing {startItem}–{endItem} of {totalItems}
            </span>

            <div className="flex items-center gap-2">
                {/* Prev button */}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    className="flex items-center gap-1"
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                </Button>

                {/* Page text */}
                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </span>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    className="flex items-center gap-1"
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
