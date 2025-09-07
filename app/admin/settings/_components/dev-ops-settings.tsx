
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Loader2 } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { CustomLoader } from '@/components/ui/custom-loader';

export function DevOpsSettings() {
    const [isClearing, setIsClearing] = useState(false);
    const { toast } = useToast();
    const { hasPermission, permissionsLoading } = useAuth();
    const canExecute = hasPermission('devops', 'execute');

    const handleClearCache = async () => {
        setIsClearing(true);
        
        toast({
            title: 'Clearing Cache...',
            description: 'Attempting to clear all browser caches and service workers.',
        });

        try {
            // 1. Clear Service Workers cache
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (const name of cacheNames) {
                    await caches.delete(name);
                }
            }

            // 2. Clear LocalStorage & SessionStorage
            localStorage.clear();
            sessionStorage.clear();

            // 3. Clear all registered Service Workers
            if ("serviceWorker" in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                    await reg.unregister();
                }
            }
            
            toast({
                title: 'Cache Cleared Successfully!',
                description: 'The application will now perform a hard reload.',
            });

            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setIsClearing(false);
            // 4. Force reload by re-assigning href
            window.location.href = window.location.href;

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error Clearing Cache',
                description: error.message || 'Could not clear all caches. Please try clearing your browser data manually.',
            });
            setIsClearing(false);
        }
    };
    
    if (permissionsLoading) {
        return <CustomLoader />;
    }
    
    if (isClearing) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-medium">Refreshing application with the latest changes...</p>
                    <p className="text-sm text-muted-foreground">Please wait, this won't take long.</p>
                </div>
            </div>
        );
    }
    
    if (!canExecute) {
        return (
             <Card className="border-amber-500/50">
                <CardHeader>
                    <CardTitle>Permissions Required</CardTitle>
                    <CardDescription>
                        You do not have the required permissions to access developer operations. Please contact a super administrator.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }
    
    return (
        <div className="space-y-6">
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle>Hard Clear Browser Cache</CardTitle>
                    <CardDescription>
                        This will forcefully clear all application data from your browser including caches, local storage, and service workers, then reload the page. Use this if you are not seeing the latest deployed changes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button variant="destructive" onClick={handleClearCache} disabled={isClearing}>
                        {isClearing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {isClearing ? 'Clearing Cache...' : 'Clear Cache & Reload'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
