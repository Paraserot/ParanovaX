
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { adminMenuItems } from '@/components/main-nav';
import { useTheme } from 'next-themes';

type KbdContextType = {
  setOpen: (open: boolean) => void;
};

const KbdContext = createContext<KbdContextType | undefined>(undefined);

const globalShortcuts = [
    { key: "Ctrl + K", description: "Open command palette for quick search" },
    { key: "Ctrl + ,", description: "Go to Settings" },
    { key: "Ctrl + T", description: "Toggle between light and dark themes" },
    { key: "Ctrl + S", description: "Save form / Submit dialog" },
    { key: "Ctrl + Shift + Q", description: "Logout from your account" },
    { key: "?", description: "Open this help and shortcuts dialog" },
];

const pageShortcuts = [
    { key: "Ctrl + N", description: "Create new item on current page (e.g., Client, Lead)" },
    { key: "F", description: "Focus the search/filter input on list pages" },
    { key: "Space", description: "Scroll down on the dashboard page"},
    { key: "Esc", description: "Close any open dialog or menu" },
];

const navigationShortcuts = adminMenuItems.map(item => {
    const key = item.label.charAt(0);
    return { key: `G then ${key}`, description: `Go to ${item.label}` };
});


function KbdDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Help & Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Use these shortcuts to navigate and perform actions faster.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 grid md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h3 className="font-semibold mb-2">Global & Page Actions</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Shortcut</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...globalShortcuts, ...pageShortcuts].map(shortcut => (
                                    <TableRow key={shortcut.key}>
                                        <TableCell><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">{shortcut.key}</kbd></TableCell>
                                        <TableCell>{shortcut.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Navigation Shortcuts</h3>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Shortcut</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {navigationShortcuts.map(shortcut => (
                                    <TableRow key={shortcut.description}>
                                        <TableCell><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">{shortcut.key}</kbd></TableCell>
                                        <TableCell>{shortcut.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const gotoShortcuts = adminMenuItems.reduce((acc, item) => {
    const key = item.label.charAt(0).toLowerCase();
    if (!acc[key]) {
        acc[key] = { path: item.href, label: item.label, icon: item.icon };
    }
    return acc;
}, {} as { [key: string]: { path: string, label: string, icon: React.ElementType } });


export function KbdProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [gotoActive, setGotoActive] = useState(false);
  const gotoActiveRef = useRef(gotoActive);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    gotoActiveRef.current = gotoActive;
  }, [gotoActive]);

  const handleKeyDown = useCallback( async (e: KeyboardEvent) => {
    const { auth } = await import("@/lib/firebaseClient");
    
    const target = e.target as HTMLElement;
    const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

    if (e.key === 'Escape') {
        setGotoActive(false);
        return;
    }
    
    if (gotoActiveRef.current) {
        if (gotoShortcuts[e.key.toLowerCase()]) {
            e.preventDefault();
            router.push(gotoShortcuts[e.key.toLowerCase()].path);
        }
        setGotoActive(false);
        return; 
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const saveButton = document.querySelector('button[type="submit"], button[aria-label="Save"]') as HTMLButtonElement | null;
        saveButton?.click();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        signOut(auth).then(() => router.push('/login'));
        return;
    }

    if (isEditing) {
        return;
    }
    
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHelpOpen(o => !o);
        return;
    }
    
    if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="Filter"]') as HTMLInputElement | null;
        searchInput?.focus();
        return;
    }
    
    if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setGotoActive(true);
        return;
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(o => !o);
    }
     if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault();
      router.push('/admin/settings');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [router, theme, setTheme]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gotoActive) {
      timer = setTimeout(() => setGotoActive(false), 3000); // Reset after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [gotoActive]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <KbdContext.Provider value={{ setOpen: setHelpOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for actions or navigate..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
             {adminMenuItems.map(item => (
                 <CommandItem key={item.href} onSelect={() => runCommand(() => router.push(item.href))}>
                    <item.icon className="mr-2 h-4 w-4"/>
                    <span>{item.label}</span>
                    <CommandShortcut>G then {item.label.charAt(0)}</CommandShortcut>
                </CommandItem>
             ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <KbdDialog open={helpOpen} setOpen={setHelpOpen} />
       {gotoActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-background/90 backdrop-blur-md p-4 rounded-lg shadow-lg border animate-in fade-in-0">
          <div className="flex items-center gap-x-6 overflow-x-auto pb-2 no-scrollbar">
            {Object.entries(gotoShortcuts).map(([key, { label }]) => (
              <div key={key} className="flex flex-col items-center gap-1.5 w-16 shrink-0">
                 <kbd className="pointer-events-none inline-flex h-10 w-10 select-none items-center justify-center rounded-lg border bg-muted font-mono text-lg font-medium text-muted-foreground">{key.toUpperCase()}</kbd>
                 <span className="text-xs text-muted-foreground truncate w-full text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </KbdContext.Provider>
  );
}

export const useKbd = () => {
  const context = useContext(KbdContext);
  if (!context) {
    throw new Error('useKbd must be used within a KbdProvider');
  }
  return context;
};
