
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { UserNav } from "./user-nav";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type BottomNavBarProps = {
  menuItems: MenuItem[];
};

export function BottomNavBar({ menuItems }: BottomNavBarProps) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // This component is no longer used for the main navigation, 
  // but kept in case it's needed for other purposes.
  // The new Floating Action Button handles mobile navigation.
  return null;
}
