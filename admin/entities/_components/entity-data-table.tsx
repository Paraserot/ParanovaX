
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { FileDown, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Entity } from "@/services/entities";
import { CustomLoader } from "@/components/ui/custom-loader";
import { useEntityStore } from "@/store/slices/useEntityStore";
import { printAsPdf, printAsXlsx } from "@/lib/utils";


interface EntityDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  entityType: "Customer" | "Employee";
  showExportButtons?: boolean;
}

const EntityDataTableMemoized = React.memo(function EntityDataTable<TData extends Entity, TValue>({
  columns,
  data,
  entityType,
  showExportButtons = false,
}: EntityDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const { loading } = useEntityStore();
  
  const getExportData = () => {
    const header = ["S.No.", "First Name", "Last Name", "Email", "Mobile", "State", "District", "Client Name", "Client Type", "Created Date"];
    const body = data.map((entity, index) => ([
      index + 1,
      entity.firstName,
      entity.lastName,
      entity.email,
      entity.mobile,
      entity.state,
      entity.district,
      entity.clientName,
      entity.clientType ? entity.clientType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A',
      entity.createdAt ? format(new Date(entity.createdAt), "dd/MM/yyyy") : 'N/A',
    ]));
    return { header, body };
  }

  const handleExportPdf = () => {
    const { header, body } = getExportData();
    printAsPdf(`${entityType}s`, header, body);
  };
  
  const handleExportXlsx = () => {
    const { header, body } = getExportData();
    printAsXlsx(`${entityType}s`, header, body);
  };
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          placeholder={`Search by Name, Email, Mobile, Client...`}
          value={globalFilter ?? ''}
          onChange={(event) =>
            setGlobalFilter(event.target.value)
          }
          className="w-full md:max-w-sm"
        />
        {showExportButtons && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={handleExportPdf} className="w-full">
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportXlsx} className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Excel
            </Button>
            </div>
        )}
      </div>
      <div className="rounded-b-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-48">
                        <div className="flex justify-center items-center">
                            <CustomLoader />
                        </div>
                    </TableCell>
                </TableRow>
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
                  No {entityType.toLowerCase()}s found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-between space-x-2 py-4 px-4 rounded-b-md">
        <div className="text-sm text-muted-foreground">
            Total Records: {table.getFilteredRowModel().rows.length}
        </div>
        <div className="flex items-center space-x-2">
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            >
            Previous
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            Next
            </Button>
        </div>
      </div>
    </div>
  )
});

export const EntityDataTable = EntityDataTableMemoized;

    
