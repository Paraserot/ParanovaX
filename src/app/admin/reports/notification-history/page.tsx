
"use client";

import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePushNotificationStore } from '@/store/slices/usePushNotificationStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from '../../notifications/_components/columns';
import ReportNavigation from '../_components/report-navigation';

const DataTable = dynamic(() => import('../../notifications/_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

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

export default function NotificationHistoryReportPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
             <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Notification History Report</CardTitle>
                        <CardDescription>
                            Review all the push notifications that have been sent or scheduled.
                        </CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardContent className="pt-6">
                    <Suspense fallback={<DataTableSkeleton columns={columns} />}>
                        <NotificationList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
