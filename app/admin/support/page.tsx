
"use client";

import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import SupportPageContent from './_components/support-page-content';

export default function SupportPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
            <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Support Ticket Center</CardTitle>
                    <CardDescription>
                    Manage all client support requests, track their status, and ensure timely resolution.
                    </CardDescription>
                </CardHeader>
            </Card>
            
            <Suspense fallback={<PageSkeleton />}>
                <SupportPageContent />
            </Suspense>
        </div>
    );
}
