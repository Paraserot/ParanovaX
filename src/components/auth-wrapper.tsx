
"use client";
import React from 'react';

// This component is no longer necessary and can be safely removed.
// The logic has been consolidated into the individual layouts (admin/layout.tsx and client/layout.tsx).
// Keeping the file to prevent breaking any potential imports, but its content is cleared.
export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
