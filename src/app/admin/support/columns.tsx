
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
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
import { Ticket, deleteTicket } from "@/services/tickets"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500";
    }
};

const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500";
    }
};

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
        const date = row.original.createdAt;
        return <div>{date ? format(new Date(date), "dd/MM/yyyy") : 'N/A'}</div>
    }
  },
  {
    accessorKey: "client.firmName",
    header: "Client",
  },
  {
    accessorKey: "title",
    header: "Subject",
    cell: ({ row }) => {
        const ticket = row.original;
        return (
            <Link href={`/admin/support/${ticket.id}`} className="font-medium text-primary hover:underline">
                {ticket.title}
            </Link>
        )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const formattedStatus = status.replace('_', ' ');
        return <Badge className={cn("capitalize", getStatusBadge(status))}>{formattedStatus}</Badge>
    }
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return <Badge className={cn("capitalize", getPriorityBadge(priority))}>{priority}</Badge>
    }
  },
  {
    accessorKey: "assignee.name",
    header: "Assigned To",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const ticket = row.original;
      const { toast } = useToast();
      const { hasPermission } = useAuth();

      const canEdit = hasPermission('support', 'edit');
      const canDelete = hasPermission('support', 'delete');
      
      const handleDelete = async () => {
        try {
            await deleteTicket(ticket.id!);
            (table.options.meta as any)?.refreshData();
            toast({ title: 'Success', description: 'Ticket deleted successfully.' });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete ticket.' });
        }
      };

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
                {canEdit && (
                  <DropdownMenuItem onClick={() => (table.options.meta as any)?.handleEdit(ticket)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Ticket
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canDelete && (
                  <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Ticket
                      </DropdownMenuItem>
                  </AlertDialogTrigger>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the ticket
                    "{ticket.title}".
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
