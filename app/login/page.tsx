
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebaseClient";
import { recordLoginActivity } from "@/services/users";
import { AnimatedAuthIllustration } from "@/components/animated-auth-illustration";
import { BrandLogo } from "@/components/brand-logo";
import { AnimatedBlobs } from "@/components/AnimatedBlobs";
import { useLoading } from "@/hooks/use-loading";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { startLoading, stopLoading } = useLoading();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const handleLogin = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        startLoading();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            if (adminDoc.exists()) {
                await recordLoginActivity(values.email, 'admin');
                toast({ title: "Admin Login Successful!", description: "Redirecting to your dashboard..." });
                router.push(searchParams.get('redirect') || '/admin/dashboard');
            } else {
                const clientDoc = await getDoc(doc(db, "clients", user.uid));
                if (clientDoc.exists()) {
                    await recordLoginActivity(values.email, 'client');
                    toast({ title: "Client Login Successful!", description: "Welcome back!" });
                    router.push(searchParams.get('redirect') || '/client/dashboard');
                } else {
                    throw new Error("No matching admin or client account found.");
                }
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            const errorMessage =
                error.code === "auth/invalid-credential"
                    ? "Invalid email or password. Please try again."
                    : error.message || "An unexpected error occurred. Please try again.";

            toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
            stopLoading();
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-transparent">
             <AnimatedBlobs />
            <Card className="w-full max-w-4xl grid md:grid-cols-2 overflow-hidden interactive-card shadow-purple animate-float">
                 <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary/10">
                    <AnimatedAuthIllustration />
                </div>
                <div className="p-8 flex flex-col justify-center">
                    <CardHeader className="text-center p-0 mb-6">
                        <BrandLogo />
                        <CardTitle className="text-3xl font-bold pt-6">Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <FormControl>
                                                <Input id="email" type="email" placeholder="you@example.com" {...field} className="h-10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel htmlFor="password">Password</FormLabel>
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} className="h-10 pr-10" />
                                                </FormControl>
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-10 text-md" variant="border-gradient" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    Log In
                                </Button>
                            </form>
                        </Form>
                        
                         <p className="mt-6 text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Register here
                            </Link>
                        </p>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}
