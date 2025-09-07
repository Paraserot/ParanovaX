
"use client";
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import RolePageContent from './_components/role-page-content';

export default function RolesPage() {
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Roles & Permissions</CardTitle>
                    <CardDescription>
                        Define user roles and manage fine-grained permissions for each module in the system.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Suspense fallback={<PageSkeleton />}>
                <RolePageContent />
            </Suspense>
        </div>
    );
}
