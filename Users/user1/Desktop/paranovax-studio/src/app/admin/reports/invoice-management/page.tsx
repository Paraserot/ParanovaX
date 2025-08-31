
"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useInvoiceStore } from '@/store/slices/useInvoiceStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { columns } from "../../invoices/_components/columns";
import ReportNavigation from '../_components/report-navigation';

const DataTable = dynamic(() => import('../../invoices/_components/data-table').then(m=>m.DataTable), { ssr: false, loading: () => <DataTableSkeleton columns={columns({ refreshData: () => {} })} /> });

function InvoiceList() {
    const { invoices, loading, fetchInvoices } = useInvoiceStore();
    
    useEffect(() => {
        fetchInvoices(true);
    }, [fetchInvoices]);
    
    const memoizedColumns = React.useMemo(() => columns({ refreshData: () => fetchInvoices(true) }), [fetchInvoices]);

    if (loading && invoices.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    return <DataTable columns={memoizedColumns} data={invoices} showExportButtons={true} />;
}


export default function InvoiceManagementReportPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
            <Card className="interactive-card">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Invoice Management Report</CardTitle>
                        <CardDescription>A detailed report of all generated invoices, their statuses, and amounts.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

             <Card className="interactive-card">
                <CardContent className="pt-6">
                     <Suspense fallback={<DataTableSkeleton columns={columns({ refreshData: () => {} })} />}>
                        <InvoiceList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
