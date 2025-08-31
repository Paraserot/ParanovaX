"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useTicketStore } from '@/store/slices/useTicketStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings } from 'lucide-react';
import { Ticket } from '@/services/tickets';
import { columns } from './columns';
import { useRouter } from 'next/navigation';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { DataTable } from './data-table';

const AddEditTicketDialog = dynamic(
  () => import('./add-edit-ticket-dialog').then(m => m.AddEditTicketDialog),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
);

function TicketList() {
    const { tickets, loading, forceRefresh, fetchTickets } = useTicketStore();

    useEffect(() => {
        const unsub = fetchTickets(true);
        return () => { if(unsub) unsub(); };
    }, [fetchTickets]);

    const handleEdit = (ticket: Ticket) => {
        (window as any).dispatchEvent(new CustomEvent('editTicket', { detail: ticket }));
    };

    const tableMeta = { handleEdit, refreshData: forceRefresh };
    const memoizedColumns = useMemo(() => columns, []);

    if (loading && tickets.length === 0) return <DataTableSkeleton columns={memoizedColumns} />;

    return <DataTable columns={memoizedColumns} data={tickets} meta={tableMeta} />;
}

export default function SupportPageContent() {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        const handleEditEvent = (event: CustomEvent) => {
            setSelectedTicket(event.detail);
            setIsDialogOpen(true);
        };
        window.addEventListener('editTicket' as any, handleEditEvent);
        return () => window.removeEventListener('editTicket' as any, handleEditEvent);
    }, []);

    const handleAddNew = () => { setSelectedTicket(null); setIsDialogOpen(true); };
    const handleSuccess = () => { useTicketStore.getState().forceRefresh(); setIsDialogOpen(false); };

    return (
        <>
            <Card className="interactive-card">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Ticket Queue</CardTitle>
                        <CardDescription>View, edit, and manage all support tickets.</CardDescription>
                    </div>
                    <div className="flex w-full flex-col md:flex-row md:w-auto items-center gap-2">
                        <Button onClick={() => router.push('/admin/settings')} variant="outline" className="w-full md:w-auto">
                            <Settings className="mr-2 h-4 w-4" /> Manage Categories
                        </Button>
                        <Button onClick={handleAddNew} variant="border-gradient" className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={[]} />}>
                        <TicketList />
                    </Suspense>
                </CardContent>
            </Card>

            {isDialogOpen && (
                <AddEditTicketDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    ticket={selectedTicket}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
