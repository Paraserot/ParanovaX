
"use client";
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import ServicePageContent from './_components/service-page-content';

export default function ServicesPage() {
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Service Management</CardTitle>
                    <CardDescription>
                    Define and manage the services you offer to your clients.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Suspense fallback={<PageSkeleton />}>
                <ServicePageContent />
            </Suspense>
        </div>
    );
}
