
"use client"

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Scissors,
  ClipboardList,
  CreditCard,
  Wallet,
  Settings,
  UserPlus
} from "lucide-react";

import { 
    SidebarMenuButton, 
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const clientMenuItems: { href: string; label: string; icon: React.ElementType }[] = [
    { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/client/employees", label: "Employees", icon: UserPlus },
    { href: "/client/attendance", label: "Attendance", icon: ClipboardList },
    { href: "/client/customers", label: "Customers", icon: Users },
    { href: "/client/services", label: "Services", icon: Scissors },
    { href: "/client/billing", label: "Billing", icon: CreditCard },
    { href: "/client/expenses", label: "Expenses", icon: Wallet },
    { href: "/client/settings", label: "Settings", icon: Settings },
];

export function ClientMainNav() {
  const pathname = usePathname();
  const { isMobile, isExpanded, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    // The setOpenMobile function might be passed down from the mobile FAB sheet
    if (setOpenMobile) {
      setOpenMobile(false);
    }
  }

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-2">
        {clientMenuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/client/dashboard" && pathname.startsWith(item.href));
            const button = (
                 <SidebarMenuButton 
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                >
                    <Link
                        href={item.href}
                        onClick={handleLinkClick}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className={cn((!isExpanded && !isMobile) && "hidden")}>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            );

            return (
                 <li key={item.href}>
                    {button}
                </li>
            )
        })}
    </ul>
  );
  
  return <nav className="flex flex-col gap-2">{renderMenuItems()}</nav>;
}
