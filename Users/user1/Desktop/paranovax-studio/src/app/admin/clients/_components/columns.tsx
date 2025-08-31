
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
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

import { Client, deleteClient } from "@/services/clients"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type ColumnsConfig = {
    onEdit: (client: Client) => void;
    refreshData: (force?: boolean) => void;
    clientTypeMap: Map<string, string>;
}

const getStatusBadgeClass = (status: string) => {
    switch(status) {
        case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700'
        case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700'
        case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const getPortalAccessBadgeClass = (hasAccess: boolean) => {
    return hasAccess
        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700'
        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700';
};


export const columns = ({ onEdit, refreshData, clientTypeMap }: ColumnsConfig): ColumnDef<Client>[] => [
  {
    accessorKey: "firmName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Firm/Business Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "firstName",
    header: "Contact Person",
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
  },
  {
    accessorKey: "email",
    header: "Email",
  },
    {
    accessorKey: "mobile",
    header: "Mobile No.",
  },
  {
    accessorKey: "clientType",
    header: "Client Type",
    cell: ({ row }) => {
        const clientTypeName = row.original.clientType;
        return clientTypeMap.get(clientTypeName) || clientTypeName;
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
    accessorKey: "portalAccess",
    header: "Portal Access",
    cell: ({ row }) => {
        const hasAccess = row.getValue("portalAccess") as boolean;
        return (
            <Badge variant="outline" className={cn("flex items-center justify-center gap-2", getPortalAccessBadgeClass(hasAccess))}>
                {hasAccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>{hasAccess ? 'Enabled' : 'Disabled'}</span>
            </Badge>
        )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Joined On",
    cell: ({ row }) => format(new Date(row.original.createdAt!), 'dd/MM/yyyy')
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original
      const { toast } = useToast()
      const { hasPermission } = useAuth()
      
      const canEdit = hasPermission('clients', 'edit');
      const canDelete = hasPermission('clients', 'delete');

      const handleDelete = async () => {
        try {
            await deleteClient(client.id!);
            toast({ title: 'Success', description: 'Client has been deleted.' });
            refreshData(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete client.' });
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
                  <DropdownMenuItem onClick={() => onEdit(client)}>
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
                    This action cannot be undone. This will permanently delete the client account for "{client.firmName}".
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
