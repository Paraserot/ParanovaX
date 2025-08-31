
"use client";

import React from 'react';
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NoInternetDialog } from "@/components/no-internet-dialog";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function Providers({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LoadingProvider>
        <AuthProvider>
          <NoInternetDialog isOnline={isOnline} />
          {children}
          <Toaster />
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}
