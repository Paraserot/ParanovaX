
"use client";

import { Suspense } from 'react';
import { PageTransitionLoader } from '@/components/page-transition-loader';

export default function ReportLayout({ children }: { children: React.ReactNode }) {
    // This empty layout prevents nesting issues and ensures each page controls its own structure.
    return (
        <Suspense fallback={<PageTransitionLoader />}>
            {children}
        </Suspense>
    );
}
