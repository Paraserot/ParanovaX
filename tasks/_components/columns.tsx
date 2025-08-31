
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

import { Task, deleteTask } from "@/services/tasks"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type ColumnsConfig = {
    onEdit: (task: Task) => void;
    refreshData: () => void;
    usersMap: Map<string, string>;
}

const getStatusBadgeClass = (status: string) => {
    switch(status) {
        case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700'
        case 'ongoing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
        case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const getPriorityBadgeClass = (priority: string) => {
    switch(priority) {
        case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700'
        case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
        case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export const columns = ({ onEdit, refreshData, usersMap }: ColumnsConfig): ColumnDef<Task>[] => {  
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => usersMap.get(row.original.assignedTo) || row.original.assignedTo,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
          const priority = row.getValue("priority") as string;
          return (
              <Badge variant="outline" className={cn("capitalize", getPriorityBadgeClass(priority))}>
                  {priority}
              </Badge>
          )
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
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const dueDate = row.original.dueDate;
        return dueDate ? format(new Date(dueDate), 'dd/MM/yyyy') : <span className="text-muted-foreground">N/A</span>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original
        const { toast } = useToast()
        const { hasPermission } = useAuth()
        
        const canEdit = hasPermission('tasks', 'edit');
        const canDelete = hasPermission('tasks', 'delete');

        const handleDelete = async () => {
          try {
              await deleteTask(task.id!);
              toast({ title: 'Success', description: 'Task has been deleted.' });
              refreshData();
          } catch (error: any) {
              toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete task.' });
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
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Task
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {canDelete && (
                      <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Task
                          </DropdownMenuItem>
                      </AlertDialogTrigger>
                  )}
              </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task "{task.title}".
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
