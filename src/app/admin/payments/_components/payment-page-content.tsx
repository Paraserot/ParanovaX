
"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import dynamic from 'next/dynamic';
import { usePaymentStore } from "@/store/slices/usePaymentStore";
import { columns } from "./columns";
import { DataTableSkeleton } from "@/components/data-table-skeleton";

const DataTable = dynamic(() => import('./data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

export default function PaymentPageContent() {
    const { payments, loading, fetchPayments } = usePaymentStore();
    
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const memoizedColumns = React.useMemo(() => columns, []);

    if (loading && payments.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    return <DataTable columns={memoizedColumns} data={payments} />;
}
