
"use client";

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';
import DashboardPageContent from './_components/dashboard-page-content';

export default function DashboardPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <DashboardPageContent />
        </Suspense>
    );
}
