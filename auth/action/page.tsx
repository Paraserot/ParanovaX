
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, KeyRound, MailCheck, ShieldCheck } from "lucide-react";

import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomLoader } from '@/components/ui/custom-loader';
import { BrandLogo } from '@/components/brand-logo';

const passwordResetSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

function AuthActionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    const currentMode = searchParams.get('mode');
    const currentActionCode = searchParams.get('oobCode');

    if (!currentMode || !currentActionCode) {
      setError("Invalid action link. Please try again.");
      setLoading(false);
      return;
    }
    
    setMode(currentMode);
    setActionCode(currentActionCode);

    const handleAction = async () => {
      try {
        switch (currentMode) {
          case 'resetPassword':
            const userEmail = await verifyPasswordResetCode(auth, currentActionCode);
            setEmail(userEmail);
            break;
          case 'verifyEmail':
            await applyActionCode(auth, currentActionCode);
            setSuccess("Your email has been successfully verified! You can now log in.");
            break;
          default:
            throw new Error("Unsupported action mode.");
        }
      } catch (err: any) {
        setError(err.message || "Invalid or expired action link. Please request a new one.");
      } finally {
        setLoading(false);
      }
    };
    
    handleAction();
  }, [searchParams]);

  const handlePasswordReset = async (values: z.infer<typeof passwordResetSchema>) => {
    if (!actionCode) return;
    setLoading(true);
    try {
      await confirmPasswordReset(auth, actionCode, values.password);
      setSuccess("Your password has been reset successfully. You can now log in with your new password.");
      setTimeout(() => router.push('/login'), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  if (error) {
    return (
        <Card className="w-full max-w-md text-center">
            <CardHeader><CardTitle>Action Failed</CardTitle></CardHeader>
            <CardContent><p className="text-destructive">{error}</p></CardContent>
        </Card>
    )
  }
  
  if (success) {
     return (
        <Card className="w-full max-w-md text-center">
            <CardHeader className="items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                    <ShieldCheck className="h-10 w-10 text-green-500" />
                </div>
                <CardTitle>Success!</CardTitle>
            </CardHeader>
            <CardContent><p className="text-green-600">{success}</p></CardContent>
        </Card>
    )
  }
  
  if (mode === 'resetPassword' && email) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>Enter a new password for {email}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="password">New Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input 
                                                id="password" 
                                                type={showPassword ? "text" : "password"} 
                                                placeholder="Enter new password" 
                                                {...field}
                                                className="h-10 pr-10" 
                                            />
                                        </FormControl>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
  }

  return null;
}

export default function AuthActionPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
             <div className="absolute top-8 left-8">
                <BrandLogo />
            </div>
            <Suspense fallback={<CustomLoader />}>
                <AuthActionHandler />
            </Suspense>
        </div>
    )
}
