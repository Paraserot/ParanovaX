
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function SessionExpiredDialog() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-sm">
        <Card className="w-full max-w-md text-center m-4 animate-float">
             <CardHeader className="flex justify-center items-center p-6">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-destructive/10">
                    <ShieldAlert className="h-20 w-20 text-destructive animate-pulse-slow" />
                </div>
             </CardHeader>
            <CardContent className="space-y-4">
                 <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                    Access Disabled
                </CardTitle>
                <CardDescription>
                    Your portal access has been disabled by the administrator. Please contact support for assistance.
                </CardDescription>
                <Button onClick={handleGoToLogin} variant="border-gradient" className="mt-4">
                    <LogIn className="mr-2 h-4 w-4" />
                    Go to Login
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
