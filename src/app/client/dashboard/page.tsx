
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, CreditCard, Settings, Rocket, UserPlus, Scissors, Wallet, Download } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// PWA Install Logic
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const quickLinks = [
    { href: "/client/employees", label: "Manage Employees", icon: UserPlus },
    { href: "/client/customers", label: "Manage Customers", icon: Users },
    { href: "/client/services", label: "Manage Services", icon: Scissors },
    { href: "/client/attendance", label: "Track Attendance", icon: ClipboardList },
    { href: "/client/billing", label: "View Billing", icon: CreditCard },
    { href: "/client/expenses", label: "Track Expenses", icon: Wallet },
    { href: "/client/settings", label: "Update Settings", icon: Settings },
]

export default function ClientDashboardPage() {
    const { clientUser } = useAuth();
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
    };

    return (
        <div className="space-y-6">
            {installPrompt && (
                <Card className="interactive-card">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Get the Best Experience</CardTitle>
                            <CardDescription>Install the ParanovaX app on your device for quick access and a better experience.</CardDescription>
                        </div>
                        <Button onClick={handleInstallClick}>
                            <Download className="mr-2 h-4 w-4" />
                            Install App
                        </Button>
                    </CardHeader>
                </Card>
            )}

            <Card className="interactive-card bg-gradient-to-br from-primary/10 to-transparent">
                <CardHeader>
                    <CardTitle className="text-3xl">Welcome Back, {clientUser?.firstName}!</CardTitle>
                    <CardDescription>
                        Here's a quick overview of your business portal. Manage your customers, track attendance, and handle billing all in one place.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.slice(0, 4).map((link) => (
                    <Link href={link.href} key={link.href}>
                         <Card className="interactive-card h-full transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{link.label}</CardTitle>
                                <link.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    Go to {link.label.toLowerCase()}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Rocket className="h-8 w-8 text-primary" />
                        <div>
                             <CardTitle>Getting Started</CardTitle>
                             <CardDescription>Follow these steps to set up your account and streamline your workflow.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                   <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Add your staff members under the <Link href="/client/employees" className="font-medium text-primary hover:underline">Employees</Link> tab.</li>
                        <li>Create profiles for your own customers in the <Link href="/client/customers" className="font-medium text-primary hover:underline">Customers</Link> section.</li>
                        <li>Define the services you offer from the <Link href="/client/services" className="font-medium text-primary hover:underline">Services</Link> page.</li>
                        <li>Explore the <Link href="/client/settings" className="font-medium text-primary hover:underline">Settings</Link> to customize your experience.</li>
                   </ul>
                </CardContent>
            </Card>
        </div>
    )
}
