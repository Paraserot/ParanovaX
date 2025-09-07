
"use client";
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageSkeleton } from '@/components/page-skeleton';

const PaymentPageContent = dynamic(() => import('./_components/payment-page-content'), { ssr: false, loading: () => <PageSkeleton /> });

export default function PaymentsPage() {
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Payment Records</CardTitle>
                    <CardDescription>
                    View a complete log of all payments received from clients.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Browse and search through all recorded payments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Suspense fallback={<PageSkeleton />}>
                        <PaymentPageContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
