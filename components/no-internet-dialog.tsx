
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NoInternetDialog({ isOnline }: { isOnline: boolean }) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-sm transition-opacity duration-300",
        isOnline ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
    )}>
        <Card className="w-full max-w-md text-center m-4 animate-float">
             <CardHeader className="flex justify-center items-center p-6">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-destructive/10">
                    <WifiOff className="h-20 w-20 text-destructive animate-pulse-slow" />
                </div>
             </CardHeader>
            <CardContent className="space-y-4">
                 <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                    No Internet Connection
                </CardTitle>
                <CardDescription>
                    It seems you are not connected to the internet. Please check your connection and try again.
                </CardDescription>
                <Button onClick={handleRetry} variant="border-gradient" className="mt-4">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
