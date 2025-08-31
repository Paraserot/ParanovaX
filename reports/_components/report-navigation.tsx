
"use client";

import * as React from "react"
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { allReportPages } from "../report-pages";

export default function ReportNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (href: string) => {
        if (pathname !== href) {
            router.push(href);
        }
    }

    const currentPage = allReportPages.find(p => p.href === pathname);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {currentPage?.title || "Switch Report"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>Master Reports</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {allReportPages.filter(p => p.href.includes('master') || p.href.includes('user')).map((report) => (
                        <DropdownMenuItem key={report.href} onClick={() => handleNavigation(report.href)}>
                            <report.icon className="mr-2 h-4 w-4" />
                            <span>{report.title}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuLabel>Financial Reports</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                     {allReportPages.filter(p => p.href.includes('financial') || p.href.includes('invoice') || p.href.includes('payment') || p.href.includes('outstanding') || p.href.includes('expense')).map((report) => (
                        <DropdownMenuItem key={report.href} onClick={() => handleNavigation(report.href)}>
                            <report.icon className="mr-2 h-4 w-4" />
                            <span>{report.title}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                 <DropdownMenuLabel>Activity & Communication</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                     {allReportPages.filter(p => p.href.includes('activity') || p.href.includes('communication') || p.href.includes('lead') || p.href.includes('support') || p.href.includes('notification')).map((report) => (
                        <DropdownMenuItem key={report.href} onClick={() => handleNavigation(report.href)}>
                            <report.icon className="mr-2 h-4 w-4" />
                            <span>{report.title}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
