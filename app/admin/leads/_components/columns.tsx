
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { format } from 'date-fns'

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

import { Lead, deleteLead } from "@/services/leads"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type ColumnsConfig = {
    onEdit: (lead: Lead) => void;
    refreshData: () => void;
    usersMap: Map<string, string>;
}

const getStatusBadgeClass = (status: string) => {
    switch(status) {
        case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700'
        case 'contacted': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700'
        case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700'
        case 'won': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700'
        case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export const columns = ({ onEdit, refreshData, usersMap }: ColumnsConfig): ColumnDef<Lead>[] => {
  return [
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
    },
    {
      accessorKey: "mobile",
      header: "Mobile No.",
    },
    {
      accessorKey: "source",
      header: "Source",
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
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => usersMap.get(row.original.assignedTo) || row.original.assignedTo,
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) => format(new Date(row.original.createdAt!), 'dd/MM/yyyy')
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original
        const { toast } = useToast()
        const { hasPermission } = useAuth()
        
        const canEdit = hasPermission('leads', 'edit');
        const canDelete = hasPermission('leads', 'delete');

        const handleDelete = async () => {
          try {
              await deleteLead(lead.id!);
              toast({ title: 'Success', description: 'Lead has been deleted.' });
              refreshData();
          } catch (error: any) {
              toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete lead.' });
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
                  {canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(lead)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
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
                      This action cannot be undone. This will permanently delete the lead for "{lead.firstName} {lead.lastName}".
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
}
