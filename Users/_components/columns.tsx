
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

import { AdminUser, deleteUser } from "@/services/users"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type ColumnsConfig = {
    onEdit: (user: AdminUser) => void;
    refreshData: () => void;
    rolesMap: Map<string, string>;
}

const getStatusBadgeClass = (status: string) => {
    switch(status) {
        case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700'
        case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export const columns = ({ onEdit, refreshData, rolesMap }: ColumnsConfig): ColumnDef<AdminUser>[] => {
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
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "mobile",
        header: "Mobile No.",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => rolesMap.get(row.original.role) || row.original.role,
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
        accessorKey: "createdAt",
        header: "Joined On",
        cell: ({ row }) => format(new Date(row.original.createdAt!), 'dd/MM/yyyy')
    },
    {
        id: "actions",
        cell: ({ row }) => {
        const user = row.original
        const { toast } = useToast()
        const { hasPermission } = useAuth()
        
        const canEdit = hasPermission('users', 'edit');
        const canDelete = hasPermission('users', 'delete');

        const handleDelete = async () => {
            try {
                await deleteUser(user.id!);
                toast({ title: 'Success', description: 'User has been deleted.' });
                // No need to call refreshData here, onSnapshot will handle it.
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete user.' });
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
                    <DropdownMenuItem onClick={() => onEdit(user)}>
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
                        This action cannot be undone. This will permanently delete the user account for "{user.firstName} {user.lastName}".
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
