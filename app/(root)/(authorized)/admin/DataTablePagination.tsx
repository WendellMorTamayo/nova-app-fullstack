"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface DataTablePaginationProps {
  page: number;
  hasMoreResults: boolean;
  isPaging: 'next' | 'previous' | false;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isLoading: boolean;
  resultCount: number;
}

export function DataTablePagination({
  page,
  hasMoreResults,
  isPaging,
  onNextPage,
  onPreviousPage,
  isLoading,
  resultCount,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 mt-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {resultCount} user(s) on page {page}.
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={onPreviousPage}
          disabled={page === 1 || !!isPaging || isLoading}
        >
          <span className="sr-only">Go to previous page</span>
          {isPaging === 'previous' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page}
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={onNextPage}
          disabled={!hasMoreResults || !!isPaging || isLoading}
        >
          <span className="sr-only">Go to next page</span>
           {isPaging === 'next' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}