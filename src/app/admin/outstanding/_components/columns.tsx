
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Outstanding } from "@/services/outstanding"

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Paid":
            return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700";
        case "Overdue":
            return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700";
        case "Pending":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const columns: ColumnDef<Outstanding>[] = [
  {
    accessorKey: "entryDate",
    header: "Entry Date",
    cell: ({ row }) => format(new Date(row.original.entryDate), 'dd/MM/yyyy')
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "clientName",
    header: "Client",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.amount)
  },
  {
    accessorKey: "partPayment",
    header: "Part Payment",
    cell: ({ row }) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.partPayment || 0)
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.balance || 0)
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => format(new Date(row.original.dueDate), 'dd/MM/yyyy')
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge className={cn(getStatusBadge(row.original.status))}>{row.original.status}</Badge>
  },
]
