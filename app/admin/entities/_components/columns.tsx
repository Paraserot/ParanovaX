
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Entity } from "@/services/entities"

export const columns: ColumnDef<Entity>[] = [
  {
    accessorKey: "id",
    header: "S.No.",
    cell: ({ row }) => {
        return <div className="font-medium">{row.index + 1}</div>
    }
  },
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
    cell: ({ row }) => {
        const entity = row.original;
        return <div className="font-medium">{`${entity.firstName} ${entity.lastName}`}</div>
    }
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
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "district",
    header: "District",
  },
    {
    accessorKey: "clientName",
    header: "Client Name",
  },
  {
    accessorKey: "clientType",
    header: "Client Type",
    cell: ({ row }) => {
        const type = row.getValue("clientType") as string;
        const formattedType = type ? type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
        return <div>{formattedType}</div>
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
        const date = row.original.createdAt;
        return <div>{date ? format(new Date(date), "dd/MM/yyyy") : 'N/A'}</div>
    }
  },
]
