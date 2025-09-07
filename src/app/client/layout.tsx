
"use client";

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageSkeleton } from '@/components/page-skeleton';
import { SessionExpiredDialog } from '@/components/session-expired-dialog';
import { useClientStore } from '@/store/slices/useClientStore';
import { useUserStore } from '@/store/slices/useUserStore';

const ClientLayoutContent = lazy(() => import('@/components/client-layout-content'));

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
            const clientData = await fetchClient(user.uid);
            if (clientData) {
                setAdminUser(null);
                setIsVerified(true);
            } else {
                router.replace('/admin/dashboard');
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

    return (
         <Suspense fallback={<PageSkeleton />}>
            <ClientLayoutContent>{children}</ClientLayoutContent>
        </Suspense>
    );
}
