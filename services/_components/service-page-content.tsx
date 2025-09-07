
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Service } from '@/services/services';
import { useAuth } from '@/hooks/useAuth';
import { useServiceStore } from '@/store/slices/useServiceStore';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from './columns';
import { PageSkeleton } from '@/components/page-skeleton';
import { AddEditServiceDialog } from './add-edit-service-dialog';
import { DataTable } from './data-table';


function ServiceList() {
    const { services, loading, fetchServices } = useServiceStore();

    useEffect(() => {
        const unsubscribe = fetchServices();
        return () => unsubscribe();
    },[fetchServices])

    const handleEdit = (service: Service) => {
        (window as any).dispatchEvent(new CustomEvent('editService', { detail: service }));
    };
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchServices(true) }), [fetchServices]);

    if (loading && services.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    return <DataTable columns={memoizedColumns} data={services} />;
}

export default function ServicePageContent() {
    const { hasPermission } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const canCreate = hasPermission('services', 'create');

    useEffect(() => {
        const handleEditEvent = (event: CustomEvent) => {
            setSelectedService(event.detail);
            setIsDialogOpen(true);
        };

        window.addEventListener('editService' as any, handleEditEvent);
        return () => window.removeEventListener('editService' as any, handleEditEvent);
    }, []);

    const handleAddNew = () => {
        setSelectedService(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        useServiceStore.getState().fetchServices(true);
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card className="interactive-card">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Services Offered</CardTitle>
                        <CardDescription>Browse, search, and manage your list of services.</CardDescription>
                    </div>
                    {canCreate && (
                        <Button onClick={handleAddNew} variant="border-gradient" className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: ()=>{}, refreshData: ()=>{}})} />}>
                        <ServiceList />
                    </Suspense>
                </CardContent>
            </Card>

            {isDialogOpen && (
                    <AddEditServiceDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        service={selectedService}
                        onSuccess={handleSuccess}
                    />
            )}
        </>
    );
}
