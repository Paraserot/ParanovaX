
"use client";

import LayoutWrapper from '@/app/layout-wrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <LayoutWrapper type="admin">{children}</LayoutWrapper>;
}
