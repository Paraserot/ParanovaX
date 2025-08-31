
"use client";

import React, { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePaymentStore } from "@/store/slices/usePaymentStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { columns } from "../../payments/_components/columns";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import ReportNavigation from '../_components/report-navigation';

const DataTable = dynamic(() => import('../../payments/_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

function PaymentList() {
    const { payments, loading, fetchPayments } = usePaymentStore();

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);


    if (loading && payments.length === 0) {
        return <DataTableSkeleton columns={columns} />;
    }
    
    return (
         <Card className="interactive-card">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Browse and search through all recorded payments.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={payments} />
            </CardContent>
        </Card>
    );
}

export default function PaymentRecordsReportPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
            <Card className="interactive-card">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Payment Records Report</CardTitle>
                        <CardDescription>A complete log of all successful, pending, and failed payments.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

             <Suspense fallback={<DataTableSkeleton columns={columns} />}>
                <PaymentList />
            </Suspense>
        </div>
    );
}
