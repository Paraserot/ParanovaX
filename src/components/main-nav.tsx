

"use client"

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  UserCog,
  Megaphone,
  Headset,
  ClipboardCheck,
  ShieldCheck,
  FileText,
  DollarSign,
  Bell,
  BarChart3,
  Receipt,
  ConciergeBell,
  Filter,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Module } from "@/lib/permissions";
import { 
    SidebarMenuButton, 
    SidebarMenuBadge,
} from "./ui/sidebar";
import { useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";

export const adminMenuItems: { href: string; label: string; icon: React.ElementType, module: Module, isNotification?: boolean }[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, module: 'dashboard' },
    { href: "/admin/leads", label: "Leads", icon: Filter, module: 'leads' },
    { href: "/admin/clients", label: "Clients", icon: Briefcase, module: 'clients' },
    { href: "/admin/services", label: "Services", icon: ConciergeBell, module: 'services' },
    { href: "/admin/invoices", label: "Invoices", icon: Receipt, module: 'invoices' },
    { href: "/admin/payments", label: "Payments", icon: CreditCard, module: 'payments' },
    { href: "/admin/outstanding", label: "Outstanding", icon: FileText, module: 'outstanding' },
    { href: "/admin/reports", label: "Reports", icon: BarChart3, module: 'reports' },
    { href: "/admin/users", label: "Users", icon: UserCog, module: 'users' },
    { href: "/admin/roles", label: "Roles", icon: ShieldCheck, module: 'roles' },
    { href: "/admin/communication", label: "Communication", icon: Megaphone, module: 'communication', isNotification: true },
    { href: "/admin/tasks", label: "Task Manager", icon: ClipboardCheck, module: 'tasks' },
    { href: "/admin/expenses", label: "Admin Expenses", icon: DollarSign, module: 'expenses' },
    { href: "/admin/support", label: "Support", icon: Headset, module: 'support', isNotification: true },
    { href: "/admin/notifications", label: "Notifications", icon: Bell, module: 'notifications', isNotification: true },
];

export function MainNav() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const { isMobile, isExpanded, setOpenMobile } = useSidebar();
  
  // Notification counts would be fetched from their respective stores on the relevant pages
  // For simplicity, we'll remove the live count logic from this shared component.
  const notificationCounts = {
      support: 0,
      communication: 0,
      notifications: 0,
  };

  const visibleMenuItems = React.useMemo(() => adminMenuItems.filter(item => hasPermission(item.module, 'view')), [hasPermission]);

  const handleLinkClick = () => {
    // The setOpenMobile function might be passed down from the mobile FAB sheet
    if (setOpenMobile) {
      setOpenMobile(false);
    }
  }

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-2">
        {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const notificationCount = notificationCounts[item.module as keyof typeof notificationCounts] || 0;
            
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
                         {item.isNotification && notificationCount > 0 && (
                            <SidebarMenuBadge>
                                {notificationCount}
                            </SidebarMenuBadge>
                        )}
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
