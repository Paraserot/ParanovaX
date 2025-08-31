
"use client";

import LayoutWrapper from '@/app/layout-wrapper';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return <LayoutWrapper type="client">{children}</LayoutWrapper>;
}
