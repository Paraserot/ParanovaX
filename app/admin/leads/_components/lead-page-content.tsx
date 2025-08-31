
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Lead } from '@/services/leads';
import { useAuth } from '@/hooks/useAuth';
import { useLeadStore } from '@/store/slices/useLeadStore';
import { useUserStore } from '@/store/slices/useUserStore';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from './columns';
import { PageSkeleton } from '@/components/page-skeleton';
import { AddEditLeadDialog } from './add-edit-lead-dialog';
import { DataTable } from './data-table';


function LeadList() {
    const { leads, loading, fetchLeads } = useLeadStore();
    const { usersMap } = useUserStore();

    useEffect(() => {
        const unsubscribe = fetchLeads();
        return () => unsubscribe();
    }, [fetchLeads]);
    
    const handleEdit = (lead: Lead) => {
        (window as any).dispatchEvent(new CustomEvent('editLead', { detail: lead }));
    };
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchLeads(), usersMap }), [usersMap, fetchLeads]);

    if (loading && leads.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    return <DataTable columns={memoizedColumns} data={leads} />;
}

export default function LeadPageContent() {
    const { hasPermission } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const canCreate = hasPermission('leads', 'create');

    useEffect(() => {
        const handleEditEvent = (event: CustomEvent) => {
            setSelectedLead(event.detail);
            setIsDialogOpen(true);
        };

        window.addEventListener('editLead' as any, handleEditEvent);
        return () => window.removeEventListener('editLead' as any, handleEditEvent);
    }, []);

    const handleAddNew = () => {
        setSelectedLead(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        useLeadStore.getState().fetchLeads();
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card className="interactive-card">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Lead Funnel</CardTitle>
                        <CardDescription>Browse, search, and manage your list of leads.</CardDescription>
                    </div>
                    <div className="flex w-full md:w-auto items-center">
                        {canCreate && (
                            <Button onClick={handleAddNew} variant="border-gradient" className="w-full md:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Lead
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: ()=>{}, refreshData: ()=>{}, usersMap: new Map()})} />}>
                        <LeadList />
                    </Suspense>
                </CardContent>
            </Card>

            {isDialogOpen && (
                    <AddEditLeadDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        lead={selectedLead}
                        onSuccess={handleSuccess}
                    />
            )}
        </>
    );
}
