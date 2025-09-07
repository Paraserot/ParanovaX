
"use client";
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import UserPageContent from './_components/user-page-content';

export default function UsersPage() {
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">User Management</CardTitle>
                    <CardDescription>
                    Manage all staff accounts, their roles, and system access from this central hub.
                    </CardDescription>
                </CardHeader>
            </Card>
            
            <Suspense fallback={<PageSkeleton />}>
                <UserPageContent />
            </Suspense>
        </div>
    );
}
