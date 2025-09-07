
"use client";

import { useSidebar } from "./ui/sidebar";
import { BrandLogo } from "./brand-logo";

export function SidebarLogo() {
    const { isExpanded } = useSidebar();
    return <BrandLogo isExpanded={isExpanded} />;
}
