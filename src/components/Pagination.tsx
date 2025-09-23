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

    return (
        <div className="flex justify-end items-center gap-2 mt-6">
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

            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>

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
    );
};
