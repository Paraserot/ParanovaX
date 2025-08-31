
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Role, deleteRole } from "@/services/roles"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

type ColumnsConfig = {
    onEdit: (role: Role) => void;
    refreshData: () => void;
}

export const columns = ({ onEdit, refreshData }: ColumnsConfig): ColumnDef<Role>[] => [
  {
    accessorKey: "name",
    header: "Role Name",
  },
  {
    accessorKey: "level",
    header: "Access Level",
  },
  {
    id: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
        const router = useRouter();
        const { hasPermission } = useAuth()
        const canEdit = hasPermission('roles', 'edit');

        return (
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/admin/roles/${row.original.id}`)}
                disabled={!canEdit}
            >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Manage Permissions
            </Button>
        )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const role = row.original
      const { toast } = useToast()
      const { hasPermission } = useAuth()
      
      const canEdit = hasPermission('roles', 'edit');
      const canDelete = hasPermission('roles', 'delete');

      const handleDelete = async () => {
        try {
            await deleteRole(role.id!);
            toast({ title: 'Success', description: 'Role has been deleted.' });
            // No need to call refreshData here, onSnapshot will handle it.
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete role.' });
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
                  <DropdownMenuItem onClick={() => onEdit(role)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Role
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canDelete && (
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the role "{role.name}".
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
