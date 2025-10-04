"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PushNotification } from "@/services/pushNotifications"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const getStatusBadge = (status: string, scheduledDateTime?: string) => {
    if (status === 'later' && scheduledDateTime && new Date(scheduledDateTime) > new Date()) {
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700";
    }
    return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700";
};

export const columns: ColumnDef<PushNotification>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
        const description = row.original.description;
        return <p className="truncate max-w-xs">{description}</p>
    }
  },
  {
    accessorKey: "sendTime",
    header: "Status",
    cell: ({ row }) => {
        const { sendTime, scheduledDateTime } = row.original;
        const isScheduled = sendTime === 'later' && scheduledDateTime && new Date(scheduledDateTime) > new Date();
        const statusText = isScheduled ? `Scheduled for ${format(new Date(scheduledDateTime!), 'dd/MM/yy p')}` : 'Sent';
        return <Badge className={cn("capitalize", getStatusBadge(sendTime, scheduledDateTime))}>{statusText}</Badge>
    }
  },
  {
    accessorKey: "customerStatus",
    header: "Target Status",
    cell: ({ row }) => {
        const status = row.original.customerStatus;
        return <span className="capitalize">{status}</span>
    }
  },
  {
    accessorKey: "customerTypes",
    header: "Target Types",
    cell: ({ row }) => {
        const types = row.original.customerTypes || [];
        if (types.length === 0) return <span>All</span>;

        return (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span className="truncate max-w-[100px]">{types.join(', ')}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{types.join(', ')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => format(new Date(row.original.createdAt!), 'dd/MM/yyyy p')
  },
]
