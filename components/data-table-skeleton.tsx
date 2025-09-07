
"use client";

import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableSkeletonProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  rows?: number;
}

export function DataTableSkeleton<TData, TValue>({ columns, rows = 10 }: DataTableSkeletonProps<TData, TValue>) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <Skeleton className="h-10 w-full md:w-64" />
                <div className="flex w-full flex-col sm:flex-row items-center gap-2">
                    <Skeleton className="h-10 w-full sm:w-32" />
                    <Skeleton className="h-10 w-full sm:w-32" />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, i) => (
                                <TableHead key={i}>
                                    <Skeleton className="h-5 w-full" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rows }).map((_, i) => (
                            <TableRow key={i}>
                                {columns.map((column, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    )
}
