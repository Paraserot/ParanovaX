
"use client";

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useOutstandingStore } from "@/store/slices/useOutstandingStore";
import { columns } from "./_components/columns";
import { DataTableSkeleton } from '@/components/data-table-skeleton';

const DataTable = dynamic(() => import('./_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

function OutstandingList() {
    const { outstanding, loading, fetchOutstanding } = useOutstandingStore();

    useEffect(() => {
        fetchOutstanding();
    }, [fetchOutstanding]);

    if (loading && outstanding.length === 0) {
        return <DataTableSkeleton columns={columns} />;
    }
    
    return <DataTable columns={columns} data={outstanding} />;
}

export default function OutstandingPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Outstanding Payments</CardTitle>
                    <CardDescription>
                    Track all pending and overdue payments from your clients.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardHeader>
                    <CardTitle>Outstanding Dues</CardTitle>
                    <CardDescription>Browse and search through all outstanding payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={columns} />}>
                        <OutstandingList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
