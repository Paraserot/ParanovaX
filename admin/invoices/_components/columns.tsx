
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, FileText } from "lucide-react"
import { format } from 'date-fns'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { Invoice, deleteInvoice } from "@/services/invoices"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type ColumnsConfig = {
    refreshData: () => void;
}

const getStatusBadgeClass = (status: string) => {
    switch(status) {
        case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700'
        case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700'
        case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700'
        case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-700'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export const columns = ({ refreshData }: ColumnsConfig): ColumnDef<Invoice>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => {
        return <Link href={`/admin/invoices/${row.original.id}`} className="font-medium text-primary hover:underline">{row.original.invoiceNumber}</Link>
    }
  },
  {
    accessorKey: "client.firmName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.original.client.firmName
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => format(new Date(row.original.invoiceDate), 'dd/MM/yyyy')
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => format(new Date(row.original.dueDate), 'dd/MM/yyyy')
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
   
        return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
            <Badge variant="outline" className={cn("capitalize", getStatusBadgeClass(status))}>
                {status}
            </Badge>
        )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original
      const { toast } = useToast()
      const { hasPermission } = useAuth()
      
      const canEdit = hasPermission('invoices', 'edit');
      const canDelete = hasPermission('invoices', 'delete');

      const handleDelete = async () => {
        try {
            await deleteInvoice(invoice.id!);
            toast({ title: 'Success', description: 'Invoice has been deleted.' });
            refreshData();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete invoice.' });
        }
      }

      return (
        <AlertDialog>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                 <DropdownMenuItem asChild>
                    <Link href={`/admin/invoices/${invoice.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View/Download
                    </Link>
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/invoices/edit/${invoice.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canDelete && (
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the invoice {invoice.invoiceNumber}.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )
    },
  },
]
