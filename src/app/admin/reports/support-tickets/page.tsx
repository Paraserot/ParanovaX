"use client";

import React, { useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTicketStore } from '@/store/slices/useTicketStore';
import { Ticket } from '@/services/tickets';
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { columns } from "../../support/_components/columns";
import ReportNavigation from '../_components/report-navigation';
import { useUserStore } from '@/store/slices/useUserStore';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';
import { DataTable } from '../../support/_components/data-table';

function TicketList() {
    const { tickets, loading, fetchTickets } = useTicketStore();

    useEffect(() => {
        const unsub = fetchTickets(true);
        return () => { if(unsub) unsub(); };
    }, [fetchTickets]);

    const handleEdit = (ticket: Ticket) => {
        console.log("Viewing ticket from report:", ticket.id);
    };

    const tableMeta = { handleEdit, refreshData: () => fetchTickets(true) };
    const memoizedColumns = useMemo(() => columns, []);

    if (loading && tickets.length === 0) return <DataTableSkeleton columns={memoizedColumns} />;

    return <DataTable columns={memoizedColumns} data={tickets} meta={tableMeta} />;
}

export default function SupportTicketsReportPage() {
    const { fetchUsers } = useUserStore();
    const { fetchClientTypes } = useClientTypeStore();

    useEffect(() => {
        fetchUsers();
        fetchClientTypes(true);
    }, [fetchUsers, fetchClientTypes]);

    return (
        <div className="space-y-6">
            <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Support Tickets Report</CardTitle>
                        <CardDescription>Comprehensive report on support tickets, resolution times, and categories.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardContent className="pt-6">
                    <Suspense fallback={<DataTableSkeleton columns={[]} />}>
                        <TicketList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
