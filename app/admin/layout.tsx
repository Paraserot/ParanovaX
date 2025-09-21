
"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { 
    SidebarProvider, 
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { useFcm } from "@/hooks/useFcm";
import { KbdProvider } from "@/hooks/use-kbd";
import { SidebarLogo } from '@/components/sidebar-logo';
import { FloatingActionButton } from '@/components/floating-action-button';
import { ForceUpdateProvider } from '@/components/force-update-provider';
import { GlobalLoader } from '@/components/global-loader';
import { Preloader } from '@/components/preloader';
import { useAuth } from '@/hooks/useAuth';
import { PageSkeleton } from '@/components/page-skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useUserStore } from '@/store/slices/useUserStore';
import { useRoleStore } from '@/store/slices/useRoleStore';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    useFcm();
    
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
                                <MainNav />
                            </SidebarContent>
                            <SidebarFooter>
                                <UserNav />
                            </SidebarFooter>
                        </Sidebar>
                        <main>
                            <div className="p-4 md:p-6 min-h-screen">
                                {children}
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isVerified, setIsVerified] = useState(false);
    const { fetchUser } = useUserStore();
    const { fetchRole } = useRoleStore();

    useEffect(() => {
        if (loading) return; 

        if (!user) {
            router.replace(`/login?redirect=${pathname}`);
            return;
        }

        const checkUser = async () => {
            try {
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                if (adminDoc.exists()) {
                    const adminData = adminDoc.data();
                    fetchUser(user.uid);
                    if (adminData.role) {
                        fetchRole(adminData.role);
                    }
                    setIsVerified(true);
                } else {
                    router.replace('/client/dashboard');
                }
            } catch(e) {
                 console.error("Failed to verify admin user:", e);
                 router.replace(`/login?redirect=${pathname}`);
            }
        };
        checkUser();
    }, [user, loading, router, pathname, fetchUser, fetchRole]);

    if (loading || !isVerified) {
        return <PageSkeleton />;
    }

    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
