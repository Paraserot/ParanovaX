"use client";

import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePushNotificationStore } from '@/store/slices/usePushNotificationStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { columns } from './_components/columns';
import { DataTableSkeleton } from '@/components/data-table-skeleton';

const DataTable = dynamic(() => import('./_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

function NotificationList() {
    const { pushNotifications, loading, fetchPushNotifications } = usePushNotificationStore();

    useEffect(() => {
        fetchPushNotifications();
    }, [fetchPushNotifications]);

    if (loading && pushNotifications.length === 0) {
        return <DataTableSkeleton columns={columns} />;
    }

    return <DataTable columns={columns} data={pushNotifications} />;
}

export default function NotificationsPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Notification History</CardTitle>
                    <CardDescription>
                    Review all the push notifications that have been sent or scheduled.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardHeader>
                    <CardTitle>Sent Notifications</CardTitle>
                    <CardDescription>Browse and search through all past and scheduled notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={columns} />}>
                        <NotificationList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
