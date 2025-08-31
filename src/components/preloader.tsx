

"use client";

import Link from "next/link";
import { adminMenuItems } from "./main-nav";
import { clientMenuItems } from "./client/client-main-nav";

/**
 * A hidden component that renders Links to all main application pages.
 * This leverages Next.js's default behavior to pre-fetch the JavaScript
 * chunks for these pages, ensuring they are ready
 * for instant navigation after the initial data load.
 */
export function Preloader() {
    return (
        <div style={{ display: 'none' }} aria-hidden="true">
            {adminMenuItems.map(item => (
                <Link key={`preload-admin-${item.href}`} href={item.href} prefetch={true} />
            ))}
            {clientMenuItems.map(item => (
                <Link key={`preload-client-${item.href}`} href={item.href} prefetch={true} />
            ))}
        </div>
    );
}

