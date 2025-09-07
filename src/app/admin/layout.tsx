
"use client";

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageSkeleton } from '@/components/page-skeleton';
import { useUserStore } from '@/store/slices/useUserStore';
import { useRoleStore } from '@/store/slices/useRoleStore';

// Lazy loaded components
const AdminLayoutContent = lazy(() => import('@/components/admin-layout-content'));


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isVerified, setIsVerified] = useState(false);
    const { fetchUser, setAdminUser } = useUserStore();
    const { fetchRole } = useRoleStore();

    useEffect(() => {
        if (loading) return; 

        if (!user) {
            router.replace(`/login?redirect=${pathname}`);
            return;
        }

        const checkUser = async () => {
            // This function now correctly fetches user and role data,
            // then sets verification status.
            const adminData = await fetchUser(user.uid);
            if (adminData) {
                 if (adminData.role) {
                    await fetchRole(adminData.role);
                }
                setIsVerified(true);
            } else {
                 // If not an admin, clear adminUser from store and redirect.
                 setAdminUser(null);
                 router.replace('/client/dashboard');
            }
        };

        checkUser();
    }, [user, loading, router, pathname, fetchUser, fetchRole, setAdminUser]);

    if (loading || !isVerified) {
        return <PageSkeleton />;
    }

    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}
