
"use client";

import React from "react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, LifeBuoy, Sun, Moon, Laptop } from "lucide-react"
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "./ui/skeleton";
import { useSidebar } from "./ui/sidebar";
import { APP_VERSION } from "@/lib/app-version";
import { cn } from "@/lib/utils";
import { useKbd } from "@/hooks/use-kbd";
import { useTheme } from "next-themes";
import type { AdminUser } from "@/services/users";
import type { Client } from "@/services/clients";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";


type UserNavProps = {
  isMobileSheet?: boolean;
  onLinkClick?: () => void;
}

export function UserNav({ isMobileSheet = false, onLinkClick }: UserNavProps) {
  const router = useRouter();
  const { adminUser, clientUser, loading } = useAuth();
  const { isExpanded } = useSidebar();
  const { setOpen } = useKbd();
  const { setTheme } = useTheme();

  const handleLogout = async () => {
    onLinkClick?.();
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleNavigation = (path: string) => {
    onLinkClick?.();
    router.push(path);
  }
  
  const currentUser = adminUser || clientUser;

  if (loading || !currentUser) {
    const SkeletonNav = () => (
        <div className="flex items-center gap-3 p-2 justify-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            {(isExpanded || isMobileSheet) && <div className="flex-1 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div>}
        </div>
    );
    if(isMobileSheet) return <div className="p-4"><SkeletonNav /></div>
    return <SkeletonNav />;
  }

  const isClient = !!clientUser;
  const settingsPath = isClient ? '/client/settings' : '/admin/settings';
  const displayName = `${currentUser.firstName} ${currentUser.lastName}`;
  const subText = isClient ? (currentUser as Client).firmName : (currentUser as AdminUser).roleName || 'Admin';
  
  const menuContent = (
    <div className="w-full">
        <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{displayName}</span>
                <span className="text-xs leading-none text-muted-foreground">
                    {subText}
                </span>
                </div>
            </div>
        </DropdownMenuLabel>
      <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation(settingsPath)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
           {!isClient && (
            <DropdownMenuItem onClick={() => { onLinkClick?.(); setOpen(true);}}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Help &amp; Shortcuts</span>
            </DropdownMenuItem>
            )}
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}><Sun className="mr-2 h-4 w-4" />Light</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}><Moon className="mr-2 h-4 w-4" />Dark</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}><Laptop className="mr-2 h-4 w-4" />System</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
       <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
            v{APP_VERSION}
        </div>
    </div>
  );
  
  if (isMobileSheet) {
    return (
        <div className="w-full p-2">
             <div className="flex items-center gap-3 p-2">
                <Avatar className="h-9 w-9">
                <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{displayName}</span>
                <span className="text-xs leading-none text-muted-foreground">
                    {subText}
                </span>
                </div>
            </div>
             <Separator />
             <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => handleNavigation(settingsPath)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </Button>
            {!isClient && (
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => { onLinkClick?.(); setOpen(true);}}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Help &amp; Shortcuts</span>
                </Button>
            )}
             <Separator />
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive mt-1" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </Button>
        </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-2">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col items-start", !isExpanded && "hidden")}>
                 <span className="text-sm font-medium leading-none">{displayName}</span>
                <span className="text-xs leading-none text-muted-foreground">
                    {subText}
                </span>
            </div>
           <span className="sr-only">User Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-1" align="end" forceMount aria-label="User menu">
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Separator() {
  return <div className="h-px bg-muted my-1" />;
}
