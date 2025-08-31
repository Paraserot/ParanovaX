
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
  ColumnFiltersState,
} from "@tanstack/react-table"
import { Filter } from "lucide-react"
import { DateRange } from "react-day-picker"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { indianStates } from "@/lib/locations"
import { useClientTypeStore } from "@/store/slices/useClientTypeStore"

export type ClientFilterValues = {
  status: string[];
  clientType: string[];
  state: string;
  district: string;
  dateRange: DateRange | undefined;
  portalAccess: boolean;
};

const initialFilters: ClientFilterValues = {
  status: [],
  clientType: [],
  state: '',
  district: '',
  dateRange: undefined,
  portalAccess: false,
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [filters, setFilters] = React.useState<ClientFilterValues>(initialFilters);
  const { clientTypes } = useClientTypeStore();

  const handleFilterChange = (key: keyof ClientFilterValues, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key: 'status' | 'clientType', value: string, checked: boolean) => {
    setFilters(prev => {
        const currentValues = prev[key] as string[];
        if (checked) {
            return { ...prev, [key]: [...currentValues, value] };
        } else {
            return { ...prev, [key]: currentValues.filter(item => item !== value) };
        }
    });
  }
  
  const resetFilters = () => setFilters(initialFilters);

  const filteredData = React.useMemo(() => {
    return data.filter((client: any) => {
        if (filters.status.length && !filters.status.includes(client.status)) return false;
        if (filters.clientType.length && !filters.clientType.includes(client.clientType)) return false;
        if (filters.state && client.state !== filters.state) return false;
        if (filters.district && client.district !== filters.district) return false;
        if (filters.portalAccess && client.portalAccess !== false) return false;
        if (filters.dateRange?.from) {
          const fromDate = new Date(filters.dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (new Date(client.createdAt) < fromDate) return false;
        }
        if (filters.dateRange?.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999);
           if (new Date(client.createdAt) > toDate) return false;
        }
        return true;
    });
  }, [data, filters]);

  const table = useReactTable({
    data: filteredData,
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

  const selectedState = filters.state;
  const districts = React.useMemo(() => {
    if (!selectedState) return [];
    return indianStates.find(s => s.name === selectedState)?.districts || [];
  }, [selectedState]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          placeholder="Search by name, email, firm..."
          value={globalFilter ?? ''}
          onChange={(event) =>
            setGlobalFilter(String(event.target.value))
          }
          className="w-full md:max-w-sm"
        />
        <div className="flex w-full md:w-auto items-center gap-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Filter Clients</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="space-y-6 py-4">
                            {/* Status Filter */}
                            <div>
                                <Label className="font-semibold">Status</Label>
                                <div className="space-y-2 mt-2">
                                    {['active', 'inactive', 'pending'].map(status => (
                                        <div key={status} className="flex items-center space-x-2">
                                            <Checkbox id={`status-${status}`} checked={filters.status.includes(status)} onCheckedChange={(checked) => handleCheckboxChange('status', status, !!checked)} />
                                            <Label htmlFor={`status-${status}`} className="capitalize font-normal">{status}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Client Type Filter */}
                            <div>
                                <Label className="font-semibold">Client Type</Label>
                                <div className="space-y-2 mt-2">
                                    {clientTypes.map(type => (
                                        <div key={type.id} className="flex items-center space-x-2">
                                            <Checkbox id={`type-${type.name}`} checked={filters.clientType.includes(type.name)} onCheckedChange={(checked) => handleCheckboxChange('clientType', type.name, !!checked)} />
                                            <Label htmlFor={`type-${type.name}`} className="font-normal">{type.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             {/* Date Range Filter */}
                            <div>
                                <Label className="font-semibold">Created Date</Label>
                                <DateRangePicker date={filters.dateRange} onDateChange={(range) => handleFilterChange('dateRange', range)} />
                            </div>
                             {/* Location Filter */}
                            <div>
                                <Label className="font-semibold">Location</Label>
                                <div className="space-y-4 mt-2">
                                    <Select value={filters.state} onValueChange={val => { handleFilterChange('state', val); handleFilterChange('district', ''); }}>
                                        <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                        <SelectContent><ScrollArea className="h-60">{indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</ScrollArea></SelectContent>
                                    </Select>
                                     <Select value={filters.district} onValueChange={val => handleFilterChange('district', val)} disabled={!filters.state}>
                                        <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                        <SelectContent><ScrollArea className="h-60">{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</ScrollArea></SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {/* Portal Access Filter */}
                            <div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="portal-access" checked={filters.portalAccess} onCheckedChange={(checked) => handleFilterChange('portalAccess', !!checked)} />
                                    <Label htmlFor="portal-access" className="font-normal">Disabled Portal Access</Label>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="mt-auto pt-4 border-t">
                        <Button variant="ghost" onClick={resetFilters}>Reset All</Button>
                        <SheetClose asChild>
                            <Button>Apply Filters</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
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
            {table.getRowModel().rows?.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-between space-x-2">
        <div className="text-sm text-muted-foreground">
          Total {table.getFilteredRowModel().rows.length} row(s).
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
}
export default DataTable;
