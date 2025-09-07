
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ClientMainNav } from '@/components/client/client-main-nav';
import { UserNav } from '@/components/user-nav';
import { 
    SidebarProvider, 
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { KbdProvider } from '@/hooks/use-kbd';
import { SidebarLogo } from '@/components/sidebar-logo';
import { FloatingActionButton } from '@/components/floating-action-button';
import { ForceUpdateProvider } from '@/components/force-update-provider';
import { GlobalLoader } from '@/components/global-loader';
import { Preloader } from '@/components/preloader';
import { useAuth } from '@/hooks/useAuth';
import { PageSkeleton } from '@/components/page-skeleton';
import { SessionExpiredDialog } from '@/components/session-expired-dialog';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useClientStore } from '@/store/slices/useClientStore';
import { useUserStore } from '@/store/slices/useUserStore';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <KbdProvider>
            <ForceUpdateProvider>
                <SidebarProvider>
                    <div className="relative">
                        <Sidebar>
                            <SidebarHeader>
                                <SidebarLogo />
                            </SidebarHeader>
                            <SidebarContent>
                                <ClientMainNav />
                            </SidebarContent>
                            <SidebarFooter>
                                <UserNav />
                            </SidebarFooter>
                        </Sidebar>
                        <main>
                            <div className="p-4 md:p-6 min-h-screen">
                                <div className="animate-on-scroll">
                                    {children}
                                </div>
                            </div>
                        </main>
                        <FloatingActionButton />
                        <GlobalLoader />
                        <Preloader />
                    </div>
                </SidebarProvider>
            </ForceUpdateProvider>
        </KbdProvider>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { clientUser, fetchClient } = useClientStore();
    const [isVerified, setIsVerified] = useState(false);
    const { setAdminUser } = useUserStore();

    useEffect(() => {
        if (loading) return; 

        if (!user) {
            router.replace(`/login?redirect=${pathname}`);
            return;
        }

        const checkUser = async () => {
             try {
                const clientDoc = await getDoc(doc(db, 'clients', user.uid));
                if (clientDoc.exists()) {
                    fetchClient(user.uid);
                    setAdminUser(null);
                    setIsVerified(true);
                } else {
                    router.replace('/admin/dashboard');
                }
            } catch(e) {
                 console.error("Failed to verify client user:", e);
                 router.replace(`/login?redirect=${pathname}`);
            }
        };
        checkUser();
    }, [user, loading, router, pathname, fetchClient, setAdminUser]);

    if (loading || !isVerified || !clientUser) {
        return <PageSkeleton />;
    }

    if (clientUser.portalAccess === false) {
        return <SessionExpiredDialog />;
    }

    return <ClientLayoutContent>{children}</ClientLayoutContent>;
}
