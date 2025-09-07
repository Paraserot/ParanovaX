
"use client";
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import TaskPageContent from './_components/task-page-content';

export default function TasksPage() {

    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Task Management</CardTitle>
                    <CardDescription>
                    Assign, track, and manage all your team's tasks from this central hub.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Suspense fallback={<PageSkeleton />}>
                <TaskPageContent />
            </Suspense>
        </div>
    );
}
