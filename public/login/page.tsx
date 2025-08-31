

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Fingerprint } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
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
import { recordLoginActivity } from "@/services/users";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFingerprintLoading, setIsFingerprintLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const handleLogin = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDocSnap = await getDoc(adminDocRef);

            if (adminDocSnap.exists()) {
                await recordLoginActivity(values.email, 'admin');
                router.push("/admin/dashboard");
            } else {
                const clientDocRef = doc(db, 'clients', user.uid);
                const clientDocSnap = await getDoc(clientDocRef);
                if (clientDocSnap.exists()) {
                    await recordLoginActivity(values.email, 'client');
                    router.push("/client/dashboard");
                } else {
                    throw new Error("User data not found in any collection.");
                }
            }

        } catch (error: any) {
            console.error("Login failed:", error);
            let description = "Invalid credentials or user not found. Please try again.";
            if(error.code === 'auth/invalid-credential') {
                description = "Invalid email or password. Please check your credentials and try again.";
            }
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: description,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleFingerprintLogin = async () => {
        setIsFingerprintLoading(true);
        setTimeout(() => {
            toast({
                title: "Coming Soon!",
                description: "Biometric login is a planned feature.",
            });
            setIsFingerprintLoading(false);
        }, 1500);
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
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="you@example.com" {...field} className="h-10" disabled={isLoading || isFingerprintLoading} />
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
                                                <FormLabel>Password</FormLabel>
                                                 <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} className="h-10 pr-10" disabled={isLoading || isFingerprintLoading}/>
                                                </FormControl>
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground" disabled={isLoading || isFingerprintLoading}>
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <Button type="submit" className="w-full h-10 text-md" variant="border-gradient" disabled={isLoading || isFingerprintLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Login"}
                                </Button>
                            </form>
                        </Form>
                        
                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">OR</span>
                        </div>

                        <Button variant="outline" className="w-full h-10 text-md" onClick={handleFingerprintLogin} disabled={isLoading || isFingerprintLoading}>
                            {isFingerprintLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Fingerprint className="mr-2 h-5 w-5" />
                            )}
                            Login with Fingerprint
                        </Button>
                         <p className="mt-4 text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}
