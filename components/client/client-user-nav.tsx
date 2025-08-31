


"use client";

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
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "../ui/skeleton";
import { useSidebar } from "../ui/sidebar";
import { cn } from "@/lib/utils";

export function ClientUserNav() {
  const router = useRouter();
  const { clientUser, loading } = useAuth();
  const { isExpanded } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading || !clientUser) {
    return (
        <div className="flex items-center gap-3 p-2 justify-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            {isExpanded && <div className="flex-1 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div>}
        </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-2">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{clientUser.firstName.charAt(0)}{clientUser.lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col items-start", !isExpanded && "hidden")}>
                 <span className="text-sm font-medium leading-none">{`${clientUser.firstName} ${clientUser.lastName}`}</span>
                <span className="text-xs leading-none text-muted-foreground">
                    {clientUser.firmName}
                </span>
            </div>
           <span className="sr-only">User Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{`${clientUser.firstName} ${clientUser.lastName}`}</p>
            <p className="text-xs leading-none text-muted-foreground">
                {clientUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
