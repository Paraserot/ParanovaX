
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Payment } from "@/services/payments"

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Completed":
            return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700";
        case "Failed":
            return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700";
        case "Pending":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ row }) => format(new Date(row.original.paymentDate), 'dd/MM/yyyy')
  },
  {
    accessorKey: "firmName",
    header: "Firm Name",
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
  },
  {
    accessorKey: "clientType",
    header: "Client Type",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.amount)
  },
  {
    accessorKey: "utrNumber",
    header: "UTR/Ref No.",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge className={cn(getStatusBadge(row.original.status))}>{row.original.status}</Badge>
  },
]
