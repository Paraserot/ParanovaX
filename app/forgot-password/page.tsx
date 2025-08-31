
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedAuthIllustration } from "@/components/animated-auth-illustration";
import { BrandLogo } from "@/components/brand-logo";
import { sendPasswordReset } from "@/services/auth";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
});

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    const handlePasswordReset = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await sendPasswordReset(values.email);
            toast({
                title: "Password Reset Email Sent",
                description: "If an account exists with that email, you will receive instructions to reset your password shortly.",
                duration: 9000,
            });
            router.push('/login');

        } catch (error: any) {
            console.error("Password reset failed:", error);
            toast({
                variant: "destructive",
                title: "Request Failed",
                description: error.message || "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-transparent">
            <Card className="w-full max-w-4xl grid md:grid-cols-2 overflow-hidden interactive-card shadow-purple animate-float">
                 <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary/10">
                    <AnimatedAuthIllustration />
                </div>
                <div className="p-8 flex flex-col justify-center">
                    <CardHeader className="text-center p-0 mb-6">
                        <BrandLogo />
                        <CardTitle className="text-3xl font-bold pt-6">Forgot Your Password?</CardTitle>
                        <CardDescription>
                            No worries! Enter your email and we'll send you a reset link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <FormControl>
                                                <Input id="email" type="email" placeholder="you@example.com" {...field} className="h-10" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-10 text-md" variant="border-gradient" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                                    Send Reset Link
                                </Button>
                            </form>
                        </Form>
                        
                         <p className="mt-6 text-center text-sm text-muted-foreground">
                            Remembered your password?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Back to Login
                            </Link>
                        </p>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}
