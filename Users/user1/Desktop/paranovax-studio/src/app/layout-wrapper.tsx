
"use client";

import React, { useEffect, useState, useRef, Suspense, lazy, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Timestamp, doc, getDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { PageSkeleton } from '@/components/page-skeleton';
import { GlobalLoader } from '@/components/global-loader';
import { Preloader } from '@/components/preloader';
import { FloatingActionButton } from '@/components/floating-action-button';
import { ForceUpdateProvider } from '@/components/force-update-provider';
import { KbdProvider } from '@/hooks/use-kbd';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarLogo } from '@/components/sidebar-logo';
import { useClientStore } from '@/store/slices/useClientStore';
import { useUserStore } from '@/store/slices/useUserStore';
import { useRoleStore } from '@/store/slices/useRoleStore';
import { Client } from '@/services/clients';
import { AdminUser } from '@/services/users';
import { Role } from '@/services/roles';
import { SessionExpiredDialog } from '@/components/session-expired-dialog';
import { useFcm } from '@/hooks/useFcm';

// Lazy loaded components
const Sidebar = lazy(() => import('@/components/ui/sidebar').then(mod => ({ default: mod.Sidebar })));
const SidebarHeader = lazy(() => import('@/components/ui/sidebar').then(mod => ({ default: mod.SidebarHeader })));
const SidebarContent = lazy(() => import('@/components/ui/sidebar').then(mod => ({ default: mod.SidebarContent })));
const SidebarFooter = lazy(() => import('@/components/ui/sidebar').then(mod => ({ default: mod.SidebarFooter })));
const ClientMainNav = lazy(() => import('@/components/client/client-main-nav').then(mod => ({ default: mod.ClientMainNav })));
const MainNav = lazy(() => import('@/components/main-nav').then(mod => ({ default: mod.MainNav })));
const UserNav = lazy(() => import('@/components/user-nav').then(mod => ({ default: mod.UserNav })));


// Auth status types
type AuthStatus = 'loading' | 'verified' | 'redirecting' | 'error';

// Normalize Firestore timestamps to ISO
const normalizeDate = (value: Timestamp | {seconds:number, nanoseconds:number} | string | undefined): string => {
    if (!value) return new Date().toISOString();
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (typeof value?.seconds === 'number') {
        return new Timestamp(value.seconds, value.nanoseconds).toDate().toISOString();
    }
    if (typeof value === 'string') return value;
    return new Date().toISOString();
};

// Convert Firestore doc to Client
const toSerializableClient = (docSnap: DocumentSnapshot<DocumentData>): Client => {
    const data = docSnap.data()!;
    return {
        id: docSnap.id,
        ...data,
        createdAt: normalizeDate(data.createdAt),
        updatedAt: normalizeDate(data.updatedAt),
        lastVisit: data.lastVisit ? normalizeDate(data.lastVisit) : undefined,
    } as Client;
};

// Convert Firestore doc to AdminUser
const toSerializableAdminUser = (docSnap: DocumentSnapshot<DocumentData>): AdminUser => {
    const data = docSnap.data()!;
    return {
        id: docSnap.id,
        ...data,
        createdAt: normalizeDate(data.createdAt),
        updatedAt: normalizeDate(data.updatedAt),
    } as AdminUser;
};


// Layout content component
const LayoutContent = React.memo(({ children, type }: { children: ReactNode, type: 'client' | 'admin' }) => {
    if (type === 'admin') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useFcm();
    }
    const NavComponent = type === 'client' ? ClientMainNav : MainNav;

    return (
        <KbdProvider>
            <ForceUpdateProvider>
                <SidebarProvider>
                    <Suspense fallback={<PageSkeleton />}>
                        <div className="relative">
                            <Sidebar>
                                <SidebarHeader><SidebarLogo /></SidebarHeader>
                                <SidebarContent><NavComponent /></SidebarContent>
                                <SidebarFooter><UserNav /></SidebarFooter>
                            </Sidebar>
                            <main>
                                <div className="p-4 md:p-6 min-h-screen">{children}</div>
                            </main>
                            <FloatingActionButton />
                            <GlobalLoader />
                            <Preloader />
                        </div>
                    </Suspense>
                </SidebarProvider>
            </ForceUpdateProvider>
        </KbdProvider>
    );
});
LayoutContent.displayName = 'LayoutContent';

// Generic Layout Wrapper Props
interface LayoutWrapperProps {
    children: ReactNode;
    type: 'client' | 'admin';
}

export default function LayoutWrapper({ children, type }: LayoutWrapperProps) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isMounted = useRef(true);
    const [status, setStatus] = useState<AuthStatus>('loading');
    const { clientUser, setClientUser } = useClientStore();
    const { adminUser, setAdminUser } = useUserStore();
    const { setUserRole } = useRoleStore();

    // Cleanup
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false };
    }, []);

    // Verify user
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            if (pathname !== '/login') {
                router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            }
            return;
        }

        const checkUser = async () => {
            const userTypeKey = type === 'client' ? 'clientUser' : 'adminUser';
            const cachedUser = localStorage.getItem(userTypeKey);
            if (cachedUser) {
                try {
                    const parsedUser = JSON.parse(cachedUser);
                    if(parsedUser.id === user.uid) {
                        type === 'client' ? setClientUser(parsedUser) : setAdminUser(parsedUser);
                        if(type === 'admin' && parsedUser.role) {
                             const roleSnap = await getDoc(doc(db, 'roles', parsedUser.role));
                             if (roleSnap.exists()) setUserRole({ id: roleSnap.id, ...roleSnap.data() } as Role);
                        }
                        setStatus('verified');
                        return;
                    }
                } catch(e) {
                    localStorage.removeItem(userTypeKey);
                }
            }

            try {
                if(type === 'client') {
                    const clientDoc = await getDoc(doc(db, 'clients', user.uid));
                    if (!isMounted.current) return;
                    if (clientDoc.exists()) {
                        const clientData = toSerializableClient(clientDoc);
                        setClientUser(clientData);
                        localStorage.setItem('clientUser', JSON.stringify(clientData));
                        setStatus('verified');
                    } else {
                        setStatus('redirecting');
                        router.replace('/admin/dashboard');
                    }
                }

                if(type === 'admin') {
                    const adminDocSnap = await getDoc(doc(db, 'admins', user.uid));
                    if (!isMounted.current) return;
                    if (!adminDocSnap.exists()) {
                        setStatus('redirecting');
                        router.replace('/client/dashboard');
                        return;
                    }

                    const adminData = toSerializableAdminUser(adminDocSnap);
                    setAdminUser(adminData);
                    localStorage.setItem('adminUser', JSON.stringify(adminData));

                    if (adminData.role) {
                        const roleSnap = await getDoc(doc(db, 'roles', adminData.role));
                        if (!isMounted.current) return;
                        if (!roleSnap.exists()) {
                            throw new Error(`Role with ID "${adminData.role}" not found.`);
                        }
                        const roleData = roleSnap.data()!;
                        setUserRole({ id: roleSnap.id, ...roleData, createdAt: normalizeDate(roleData.createdAt) } as Role);
                        setStatus('verified');
                    } else {
                        throw new Error("User has no role assigned.");
                    }
                }

            } catch(e) {
                console.error("Failed to verify user:", e);
                if (!isMounted.current) return;
                setStatus('error');
                router.replace('/login?error=auth_failed');
            }
        };

        if(status === 'loading') {
            checkUser();
        }
    }, [user, authLoading, pathname, router, type, setClientUser, setAdminUser, setUserRole, status]);

    if(status !== 'verified') {
        return <PageSkeleton />;
    }
    
    if(type === 'client' && clientUser?.portalAccess === false) {
        return <SessionExpiredDialog />;
    }

    return <LayoutContent type={type}>{children}</LayoutContent>;
}
