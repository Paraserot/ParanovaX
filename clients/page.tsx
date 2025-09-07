
"use client";
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import ClientPageContent from './_components/client-page-content';

export default function ClientsPage() {
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Client Management</CardTitle>
                    <CardDescription>
                    Oversee all client accounts, manage their details, and track their status from this central hub.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Suspense fallback={<PageSkeleton />}>
                <ClientPageContent />
            </Suspense>
        </div>
    );
}
