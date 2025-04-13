"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  skeletonRowCount?: number; // Number of skeleton rows to show
  // Add handlers for row actions if needed directly here, or handle in columns.tsx
  onEditRow?: (row: TData) => void;
  onExtendRow?: (row: TData) => void;
  onHistoryRow?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  skeletonRowCount = 5, // Default skeleton rows
  // Pass down handlers
  onEditRow,
  onExtendRow,
  onHistoryRow,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Inject action handlers into the columns context if provided
  // This allows DataTableRowActions to access them via row context if needed,
  // though passing directly via props as done in columns.tsx is cleaner.
  const tableColumns = React.useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        meta: {
          ...(col.meta as object), // Preserve existing meta if any
          onEdit: onEditRow,
          onExtend: onExtendRow,
          onHistory: onHistoryRow,
        },
      })),
    [columns, onEditRow, onExtendRow, onHistoryRow]
  );


  const table = useReactTable({
    data: data ?? [], // Ensure data is always an array
    columns: tableColumns, // Use potentially modified columns
    // We manage pagination externally via Convex cursors
    manualPagination: true,
    // We manage filtering externally via Convex query filter
    manualFiltering: true,
     // Let tanstack handle sorting on the currently loaded data
    // Set manualSorting to true if you implement server-side sorting via Convex
    manualSorting: false,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // No pagination or filtering models needed here as they are manual
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
             Array.from({ length: skeletonRowCount }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                {columns.map((column, colIndex) => (
                   <TableCell key={`loading-cell-${index}-${colIndex}`}>
                     {/* Basic skeleton, adjust width/height as needed */}
                      <Skeleton className={`h-5 ${colIndex === 0 ? 'w-32' : 'w-24'}`} />
                      {colIndex === 0 && <Skeleton className="h-3 w-24 mt-1" />}
                   </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}