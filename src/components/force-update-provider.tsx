
"use client";

import { useState, useEffect } from 'react';
import { getAppConfig } from '@/services/app-config';
import { APP_VERSION } from '@/lib/app-version';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

export function ForceUpdateProvider({ children }: { children: React.ReactNode }) {
    const [needsUpdate, setNeedsUpdate] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!user || loading) return;

        const checkVersion = async () => {
            try {
                const config = await getAppConfig();
                const serverVersion = config.latestVersion;
                const clientVersion = APP_VERSION;
                
                // Simple version comparison
                if (serverVersion > clientVersion) {
                    setNeedsUpdate(true);
                }
            } catch (error) {
                console.error("Failed to check for app updates:", error);
            }
        };

        checkVersion();
        // Optionally, check periodically
        const interval = setInterval(checkVersion, 5 * 60 * 1000); // Check every 5 minutes
        return () => clearInterval(interval);

    }, [user, loading]);

    const handleUpdate = () => {
        window.location.reload();
    };

    return (
        <>
            {children}
            <AlertDialog open={needsUpdate}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Required</AlertDialogTitle>
                        <AlertDialogDescription>
                            A new version of the application is available. Please update to continue using the application.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogAction asChild>
                         <Button onClick={handleUpdate} variant="border-gradient">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Update Now
                        </Button>
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
