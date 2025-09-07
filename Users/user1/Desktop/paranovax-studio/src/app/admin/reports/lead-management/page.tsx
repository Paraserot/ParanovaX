
"use client";

import React, { useEffect, Suspense, useMemo } from "react";
import dynamic from 'next/dynamic';
import { useLeadStore } from '@/store/slices/useLeadStore';
import { useUserStore } from '@/store/slices/useUserStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lead } from '@/services/leads';
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { columns } from "../../leads/_components/columns";
import ReportNavigation from '../_components/report-navigation';

const DataTable = dynamic(() => import('../../leads/_components/data-table').then(m=>m.DataTable), { ssr: false, loading: () => <DataTableSkeleton columns={columns({onEdit: () => {}, refreshData: () => {}, usersMap: new Map()})} /> });

function LeadList() {
    const { leads, loading, fetchLeads } = useLeadStore();
    const { usersMap } = useUserStore();
    
    useEffect(() => {
        const unsub = fetchLeads(true);
        return () => unsub();
    }, [fetchLeads]);
    
    const handleEdit = (lead: Lead) => {
        // Read-only view for reports
        console.log("Viewing lead from report:", lead.id);
    };
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchLeads(true), usersMap }), [fetchLeads, usersMap]);
    
    if (loading && leads.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }
    
    return <DataTable columns={memoizedColumns} data={leads} showExportButtons={true} />;
}


export default function LeadManagementReportPage() {
    const { fetchUsers } = useUserStore();

    useEffect(() => {
        // Users are needed for the 'Assigned To' column
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="space-y-6">
            <Card className="interactive-card">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Lead Management Report</CardTitle>
                        <CardDescription>Track the entire lifecycle of leads, from creation to conversion.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

             <Card className="interactive-card">
                <CardContent className="pt-6">
                    <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: () => {}, refreshData: () => {}, usersMap: new Map()})} />}>
                        <LeadList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
