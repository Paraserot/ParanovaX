
"use client";

import React, { useEffect, useMemo, Suspense } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useInvoiceStore } from '@/store/slices/useInvoiceStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { columns } from './columns';
import { DataTableSkeleton } from '@/components/data-table-skeleton';

const DataTable = dynamic(() => import('./data-table').then(mod => mod.DataTable), {
    ssr: false,
    loading: () => <DataTableSkeleton columns={columns({ refreshData: () => {} })} />
});

export default function InvoicePageContent() {
    const { invoices, loading, fetchInvoices } = useInvoiceStore();
    
    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);
    
    const memoizedColumns = useMemo(() => columns({ refreshData: () => fetchInvoices(true) }) as ColumnDef<unknown, unknown>[], [fetchInvoices]);

    const renderContent = () => {
        if (loading && invoices.length === 0) {
            return <DataTableSkeleton columns={memoizedColumns} />;
        }
        return <DataTable columns={memoizedColumns} data={invoices} />;
    }

    return (
        <Card className="interactive-card">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle>Invoice Records</CardTitle>
                    <CardDescription>Browse, search, and manage your list of invoices.</CardDescription>
                </div>
                <Button asChild variant="border-gradient">
                    <Link href="/admin/invoices/create">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Invoice
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<DataTableSkeleton columns={memoizedColumns} />}>
                    {renderContent()}
                </Suspense>
            </CardContent>
        </Card>
    );
}
