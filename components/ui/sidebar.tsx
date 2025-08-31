
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import Cookies from 'js-cookie';

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMounted } from "@/hooks/use-mounted"

const SIDEBAR_WIDTH_EXPANDED = "16rem"
const SIDEBAR_WIDTH_COLLAPSED = "5rem" 

type SidebarContext = {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  isMobile: boolean;
  openMobile: boolean,
  setOpenMobile: (open: boolean) => void;
  toggleExpanded: () => void;
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(
  (
    {
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const isMounted = useMounted()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [isExpanded, setIsExpandedState] = React.useState(true);

    React.useEffect(() => {
        if (isMounted) {
            const savedState = Cookies.get("sidebar-expanded") === "true";
            setIsExpandedState(savedState);
        }
    }, [isMounted]);
    
    React.useEffect(() => {
      if (isMounted) {
        document.body.classList.toggle('sidebar-expanded', isExpanded && !isMobile);
        document.body.classList.toggle('sidebar-collapsed', !isExpanded && !isMobile);
      }
    }, [isExpanded, isMobile, isMounted]);

    const setIsExpanded = (value: boolean) => {
        setIsExpandedState(value);
        if (!isMobile) {
            Cookies.set("sidebar-expanded", String(value), { expires: 7 });
        }
    }

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    }
   
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        isExpanded,
        setIsExpanded,
        isMobile: !!isMobile,
        openMobile,
        setOpenMobile,
        toggleExpanded,
      }),
      [isMobile, isExpanded, openMobile]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width-expanded": SIDEBAR_WIDTH_EXPANDED,
                "--sidebar-width-collapsed": SIDEBAR_WIDTH_COLLAPSED,
                ...style,
              } as React.CSSProperties
            }
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(
  (
    {
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isExpanded, isMobile } = useSidebar();
    // The main sidebar is never rendered on mobile, the FAB is used instead.
    if (isMobile) return null;
    
    return (
      <aside
        ref={ref}
        className={cn("hidden md:fixed md:inset-y-0 md:z-50 md:flex md:flex-col transition-[width] duration-300 ease-in-out", 
            isExpanded ? "md:w-[var(--sidebar-width-expanded)]" : "md:w-[var(--sidebar-width-collapsed)]",
            className)}
        {...props}
      >
        <div className="flex h-full flex-col border-r bg-sidebar p-2 sm:py-5">
            {children}
        </div>
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { isExpanded, toggleExpanded, isMobile } = useSidebar();
  
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex shrink-0 items-center mb-4",
        isExpanded || isMobile ? "h-14 justify-between px-2" : "h-auto flex-col justify-center gap-y-2",
        className
      )}
      {...props}
    >
        <div className={cn(isExpanded || isMobile ? "flex-1 min-w-0" : "")}>{children}</div>
        {!isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleExpanded}>
                {isExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
                <span className="sr-only">Toggle sidebar</span>
            </Button>
        )}
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { isExpanded } = useSidebar();
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-0 mt-auto", isExpanded ? "" : "items-center", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-y-2 overflow-auto p-0 no-scrollbar",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  }
>(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isExpanded, isMobile } = useSidebar()

    const finalState = isMobile || isExpanded ? "expanded" : "collapsed";

    const buttonContent = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-active={isActive}
        data-state={finalState}
        className={cn("peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 h-10 text-sm",
          "justify-start",
          "data-[state=collapsed]:justify-center",
          "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
          "data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground",
          "[&>svg]:size-5 [&>svg]:shrink-0",
        className)}
        {...props}
      >
        {children}
      </Comp>
    )

    if (tooltip && finalState !== 'expanded') {
      const tooltipContent = typeof tooltip === "string" ? { children: tooltip } : tooltip;
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            {...tooltipContent}
          >
            {tooltipContent.children}
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonContent
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = useSidebar();
  
  if (!isExpanded) {
    return (
      <div
        ref={ref}
        data-sidebar="menu-badge"
        className={cn(
          "absolute top-1 right-1 h-2 w-2 rounded-full bg-primary",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground tabular-nums",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"


export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
}
