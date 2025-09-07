
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Menu, X, User, Wand2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { adminMenuItems } from './main-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { UserNav } from './user-nav';
import { useLoading } from '@/hooks/use-loading';
import { AIAssistantDialog } from '@/app/admin/dashboard/_components/ai-assistant-dialog';

const mainActions = adminMenuItems.filter(item => 
    ['dashboard', 'clients', 'leads', 'support', 'reports', 'tasks', 'invoices', 'users', 'roles', 'services', 'communication'].includes(item.module)
);

export function FloatingActionButton() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIsOpen(false);
    }
  }, [pathname]);
  
  if (!isMobile) {
    return null;
  }
  
  const allMenuItems = [...mainActions, { href: '#profile', label: 'Profile', icon: User, module: 'profile' as any }, { href: '#ai', label: 'AI Guide', icon: Wand2, module: 'ai' as any }];
  
  const radius = 140;

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  }

  const handleMenuClick = (href: string) => {
    setIsOpen(false);
    
    setTimeout(() => {
        if (href !== pathname) {
            if (href === '#profile') {
                setIsProfileOpen(true);
            } else if (href === '#ai') {
                setIsAiAssistantOpen(true);
            } else {
                router.push(href);
            }
        }
    }, 300);
  }
  
  return (
    <>
      <button
        type="button"
        onClick={toggleMenu}
        className={cn(
            "fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300"
        )}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Centered Radial Menu */}
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100 scale-100 bg-black/60 backdrop-blur-sm pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
      )}>
        <div className="relative w-full h-full flex items-center justify-center">
             {/* This button is now centered */}
            <button
                type="button"
                onClick={toggleMenu}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-2xl z-10"
            >
                <X className="h-7 w-7 text-primary"/>
            </button>
            
            {allMenuItems.map((item, index) => {
                const angle = -90 - (index * (360 / allMenuItems.length));
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                    <div
                        key={item.href}
                        className="absolute"
                         style={{
                            transition: `all 0.5s ${isOpen ? 50 + index * 40 : (allMenuItems.length - index) * 30}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
                            transform: isOpen ? `translate(${x}px, ${y}px)`: 'translate(0,0) scale(0.5)',
                            opacity: isOpen ? 1 : 0
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => handleMenuClick(item.href)}
                            className="w-20 h-20 bg-background rounded-full flex flex-col items-center justify-center shadow-lg border p-1"
                        >
                            <item.icon className="h-6 w-6 text-primary" />
                            <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center px-1">{item.label}</span>
                        </button>
                    </div>
                )
            })}
        </div>
      </div>
      
      {/* Profile Sheet */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0">
             <SheetHeader className="p-4">
                <SheetTitle className="sr-only">User Profile Menu</SheetTitle>
            </SheetHeader>
            <UserNav isMobileSheet={true} onLinkClick={() => setIsProfileOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* AI Assistant Dialog */}
      <AIAssistantDialog isOpen={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen} />
    </>
  );
}
