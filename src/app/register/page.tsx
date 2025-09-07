
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AnimatedAuthIllustration } from "@/components/animated-auth-illustration";
import { BrandLogo } from "@/components/brand-logo";
import { registerClient } from "@/services/clients";
import { indianStates } from "@/lib/locations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClientType } from "@/services/client-types";

const formSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    firmName: z.string().min(1, { message: "Firm/Business name is required." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits.'),
    state: z.string().min(1, "Please select your state."),
    district: z.string().min(1, "Please select your district."),
    clientType: z.string().min(1, "Please select your business type."),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    terms: z.boolean().default(false).refine(val => val === true, {
        message: "You must accept the terms and conditions."
    }),
});

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingTypes, setIsFetchingTypes] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchTypes() {
            setIsFetchingTypes(true);
            try {
                const response = await fetch('/api/client-types');
                if (!response.ok) {
                    throw new Error('Failed to fetch client types from server.');
                }
                const types = await response.json();
                setClientTypes(types);
            } catch (error) {
                console.error("Failed to fetch client types on client:", error);
                toast({
                    variant: "destructive",
                    title: "Could not load business types",
                    description: "There was a problem fetching business types. Please try refreshing the page."
                });
            } finally {
                setIsFetchingTypes(false);
            }
        }
        fetchTypes();
    }, [toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "", lastName: "", firmName: "", email: "", mobile: "",
            state: "", district: "", clientType: "", password: "", terms: false
        },
    });

    const selectedState = form.watch('state');
    const districts = selectedState ? indianStates.find(s => s.name === selectedState)?.districts || [] : [];

    const handleRegister = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await registerClient(values);
            toast({
                title: "Registration Successful!",
                description: "Your account has been created. Please log in to continue.",
                duration: 5000,
            });
            router.push("/login");
        } catch (error: any) {
            console.error("Registration failed:", error);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message || "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:py-8 bg-transparent">
            <div className="w-full max-w-4xl mx-auto">
                <Card className="grid md:grid-cols-2 overflow-hidden interactive-card shadow-purple animate-float">
                    <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary/10">
                        <AnimatedAuthIllustration />
                    </div>
                    <div className="p-8">
                         <div className="mb-6">
                            <BrandLogo />
                        </div>
                        <CardHeader className="text-center p-0 mb-6">
                            <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
                            <CardDescription>
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Log in
                                </Link>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel htmlFor="firstName">First Name</FormLabel><FormControl><Input id="firstName" placeholder="Fletcher" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel htmlFor="lastName">Last Name</FormLabel><FormControl><Input id="lastName" placeholder="Boyle" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                    <FormField control={form.control} name="firmName" render={({ field }) => ( <FormItem><FormLabel htmlFor="firmName">Firm/Business Name</FormLabel><FormControl><Input id="firmName" placeholder="Your Business" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel htmlFor="email">Email</FormLabel><FormControl><Input id="email" type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="mobile" render={({ field }) => ( <FormItem><FormLabel htmlFor="mobile">Mobile Number</FormLabel><FormControl><Input id="mobile" placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="state" render={({ field }) => ( <FormItem><FormLabel htmlFor="state">State</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue('district', '', { shouldValidate: true }); }} value={field.value}><FormControl><SelectTrigger id="state" name="state"><SelectValue placeholder="Select State"/></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-72">{indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage/></FormItem> )}/>
                                        <FormField control={form.control} name="district" render={({ field }) => ( <FormItem><FormLabel htmlFor="district">District</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}><FormControl><SelectTrigger id="district" name="district"><SelectValue placeholder={selectedState ? "Select District" : "Select State First"} /></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-72">{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage /></FormItem> )}/>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="clientType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="clientType">Business Type</FormLabel>
                                                <Select
                                                  onValueChange={field.onChange}
                                                  value={field.value}
                                                  disabled={isLoading || isFetchingTypes}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger id="clientType" name="clientType">
                                                            <SelectValue
                                                              placeholder={
                                                                isFetchingTypes
                                                                  ? "Loading business types..."
                                                                  : "Select your business type"
                                                              }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {clientTypes.map((ct) => (
                                                            <SelectItem key={ct.id} value={ct.name}>
                                                                {ct.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="password">Password</FormLabel>
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
                                    <FormField control={form.control} name="terms" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2"><FormControl><Checkbox id="terms" checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel htmlFor="terms" className="text-muted-foreground font-normal">I agree to the <Link href="#" className="text-primary hover:underline">Terms & Conditions</Link></FormLabel><FormMessage /></div></FormItem>)}/>
                                    <Button type="submit" className="w-full h-10 text-md" variant="border-gradient" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </div>
    );
}
