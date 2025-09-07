
"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings } from 'lucide-react';
import { Client } from '@/services/clients';
import { useAuth } from '@/hooks/useAuth';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from './columns';
import { useRouter } from 'next/navigation';
import { useClientStore } from '@/store/slices/useClientStore';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';

const AddEditClientDialog = dynamic(() => import('./add-edit-client-dialog'));
const DataTable = dynamic(() => import('./data-table'), {
    ssr: false,
    loading: () => <DataTableSkeleton columns={[]} />
});

const ClientTableWrapper = React.memo(() => {
    // Data is now pre-fetched on server, this hook gets the initial state
    const { clients, loading, fetchClients } = useClientStore(); 
    const { clientTypes, loading: typesLoading, fetchClientTypes } = useClientTypeStore();
    
    useEffect(() => {
        // Fetch initial data
        fetchClients();
        fetchClientTypes();
    }, [fetchClients, fetchClientTypes]);
    
    const clientTypeMap = useMemo(() => {
        return new Map(clientTypes.map(ct => [ct.name, ct.label]));
    }, [clientTypes]);

    const handleEdit = useCallback((client: Client) => {
        const event = new CustomEvent('editClient', { detail: client });
        window.dispatchEvent(event);
    }, []);
    
    const memoizedColumns = useMemo(() => columns({ onEdit: handleEdit, clientTypeMap, refreshData: () => fetchClients(true) }), [handleEdit, clientTypeMap, fetchClients]);
    
    const isLoading = loading || typesLoading;

    if (isLoading && clients.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }
    
    return <DataTable columns={memoizedColumns as any} data={clients as any} />;
});

ClientTableWrapper.displayName = 'ClientTableWrapper';

export default function ClientPageContent() {
    const { hasPermission } = useAuth();
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const { fetchClients } = useClientStore();
    
    const canCreate = hasPermission('clients', 'create');

    useEffect(() => {
        const handleEditEvent = (event: CustomEvent) => {
            setSelectedClient(event.detail);
            setIsDialogOpen(true);
        };

        window.addEventListener('editClient' as any, handleEditEvent);
        return () => window.removeEventListener('editClient' as any, handleEditEvent);
    }, []);

    const handleAddNew = () => {
        setSelectedClient(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        setIsDialogOpen(false);
        fetchClients(true); // Force refresh the list
    };

    return (
        <>
            <Card className="interactive-card">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Client Roster</CardTitle>
                        <CardDescription>Browse, search, and manage your list of clients.</CardDescription>
                    </div>
                    <div className="flex w-full flex-col md:flex-row md:w-auto items-center gap-2">
                         <Button onClick={() => router.push('/admin/settings')} variant="outline" className="w-full md:w-auto">
                            <Settings className="mr-2 h-4 w-4" /> Manage Client Types
                        </Button>
                        {canCreate && (
                            <Button onClick={handleAddNew} variant="border-gradient" className="w-full md:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={[]} />}>
                        <ClientTableWrapper />
                    </Suspense>
                </CardContent>
            </Card>

            {isDialogOpen && (
                <AddEditClientDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    client={selectedClient}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}

    