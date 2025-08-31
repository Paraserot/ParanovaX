
"use client";
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageSkeleton } from '@/components/page-skeleton';
import InvoicePageContent from './_components/invoice-page-content';

export default function InvoicesPage() {
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Invoice Management</CardTitle>
                    <CardDescription>
                        Create, view, and manage all client invoices from this central hub.
                    </CardDescription>
                </CardHeader>
            </Card>
            
            <Suspense fallback={<PageSkeleton />}>
                <InvoicePageContent />
            </Suspense>
        </div>
    );
}
