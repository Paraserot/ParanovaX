
"use client";

import { useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useOutstandingStore } from "@/store/slices/useOutstandingStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { columns } from "../../outstanding/_components/columns";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import ReportNavigation from "../_components/report-navigation";

const DataTable = dynamic(() => import('../../outstanding/_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

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

export default function OutstandingPaymentsReportPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
            <Card className="interactive-card">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Outstanding Payments Report</CardTitle>
                        <CardDescription>Track all outstanding amounts, including partial payments and credit days.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardContent className="pt-6">
                    <Suspense fallback={<DataTableSkeleton columns={columns} />}>
                        <OutstandingList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
