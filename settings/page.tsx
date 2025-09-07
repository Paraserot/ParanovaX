
"use client";

import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Building, Users, Ticket, Terminal } from "lucide-react";
import { PageSkeleton } from '@/components/page-skeleton';
import { CompanyProfileSettings } from './_components/company-profile-settings';
import { ManageClientTypes } from './_components/manage-client-types';
import { ManageTicketCategories } from './_components/manage-ticket-categories';
import { DevOpsSettings } from './_components/dev-ops-settings';

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
            <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Application Settings</CardTitle>
                    <CardDescription>Manage core application configurations and business logic.</CardDescription>
                </CardHeader>
            </Card>
            
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile"><Building className="mr-2 h-4 w-4" /> Company Profile</TabsTrigger>
                    <TabsTrigger value="clientTypes"><Users className="mr-2 h-4 w-4" /> Client Types</TabsTrigger>
                    <TabsTrigger value="ticketCategories"><Ticket className="mr-2 h-4 w-4" /> Support Categories</TabsTrigger>
                    <TabsTrigger value="devOps"><Terminal className="mr-2 h-4 w-4" /> Dev-Ops</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Company Profile</CardTitle>
                            <CardDescription>
                                Manage your company's branding across the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<PageSkeleton />}>
                                <CompanyProfileSettings />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="clientTypes">
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Client Types</CardTitle>
                            <CardDescription>
                                Define the different types of clients your business serves (e.g., Hotel Owner, Restaurant).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Suspense fallback={<PageSkeleton />}>
                                <ManageClientTypes />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="ticketCategories">
                     <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Support Ticket Categories</CardTitle>
                            <CardDescription>
                                Create and manage categories for support tickets. You can auto-assign categories to specific users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<PageSkeleton />}>
                                <ManageTicketCategories />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="devOps">
                     <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Developer Operations</CardTitle>
                            <CardDescription>
                                Use these tools for development and troubleshooting purposes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<PageSkeleton />}>
                                <DevOpsSettings />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
