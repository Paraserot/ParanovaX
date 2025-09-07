
"use client";

import React, { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePaymentStore } from "@/store/slices/usePaymentStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { columns } from "../../payments/_components/columns";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import ReportNavigation from '../_components/report-navigation';
import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { printAsPdf, printAsXlsx } from '@/lib/utils';
import { format } from 'date-fns';

const DataTable = dynamic(() => import('../../payments/_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

function PaymentList() {
    const { payments, loading, fetchPayments } = usePaymentStore();

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const getExportData = () => {
        const header = ["#", "Payment Date", "Firm Name", "Client Name", "Client Type", "Amount", "UTR/Ref No.", "Status"];
        const body = payments.map((payment, i) => [
            i + 1,
            format(new Date(payment.paymentDate), "dd/MM/yyyy"),
            payment.firmName,
            payment.clientName,
            payment.clientType,
            `Rs. ${payment.amount.toFixed(2)}`,
            payment.utrNumber,
            payment.status,
        ]);
        return { header, body };
    };

    const handleExportPdf = () => {
        const { header, body } = getExportData();
        printAsPdf("Payment Records", header, body);
    };

    const handleExportXlsx = () => {
        const { header, body } = getExportData();
        printAsXlsx("Payment Records", header, body);
    };

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
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <Button onClick={handleExportPdf} variant="outline" className="w-full sm:w-auto">
                        <FileDown className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                    <Button onClick={handleExportXlsx} variant="outline" className="w-full sm:w-auto">
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
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
