
"use client";
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import LeadPageContent from './_components/lead-page-content';

export default function LeadsPage() {
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Lead Management</CardTitle>
                    <CardDescription>
                    Capture, track, and manage all your potential business leads from one central hub.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Suspense fallback={<PageSkeleton />}>
                <LeadPageContent />
            </Suspense>
        </div>
    );
}
